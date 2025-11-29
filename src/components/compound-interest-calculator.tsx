'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { addDays, addMonths, differenceInDays, format, startOfDay } from 'date-fns';
import { CalendarIcon, Download, Info } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { ScrollArea } from './ui/scroll-area';

const currencySymbols: { [key: string]: string } = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
};

const formSchema = z.object({
  currency: z.string().min(1, 'Currency is required'),
  principal: z.number().min(0, 'Principal must be a positive number'),
  dailyInterest: z.number().min(0, 'Daily interest must be a positive number'),
  durationValue: z.number().positive('Duration must be a positive number'),
  durationUnit: z.enum(['days', 'weeks', 'months', 'years']),
  reinvest: z.number().min(0).max(100, 'Reinvest percentage must be between 0 and 100'),
  daysOfWeek: z.array(z.number()).optional(),
  monthlyContributionType: z.enum(['none', 'deposit', 'withdrawal']),
  monthlyContributionValue: z.number().min(0).optional(),
  oneTimeTopOff: z.number().min(0).optional(),
  oneTimeTopOffDate: z.date().optional(),
});

type FormData = z.infer<typeof formSchema>;

type CalculationResult = {
  date: string;
  dayOfWeek: string;
  deposits: number;
  withdrawals: number;
  interest: number;
  balance: number;
};

const defaultValues: FormData = {
  currency: 'USD',
  principal: 1000,
  dailyInterest: 0.5,
  durationValue: 1,
  durationUnit: 'years',
  reinvest: 100,
  daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  monthlyContributionType: 'none',
  monthlyContributionValue: 0,
  oneTimeTopOff: 0,
  oneTimeTopOffDate: undefined,
};

const weekDays = [
  { id: 1, label: 'Mon' }, { id: 2, label: 'Tue' }, { id: 3, label: 'Wed' },
  { id: 4, label: 'Thu' }, { id: 5, label: 'Fri' }, { id: 6, label: 'Sat' },
  { id: 0, label: 'Sun' },
];

export function CompoundInterestCalculator() {
  const [results, setResults] = useState<CalculationResult[]>([]);
  const [activeTab, setActiveTab] = useState('daily');
  const [summary, setSummary] = useState<{
    totalPrincipal: number;
    totalInterest: number;
    finalBalance: number;
    startDate: Date | null;
    endDate: Date | null;
  } | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const [symbol, setSymbol] = useState(currencySymbols[defaultValues.currency] || '$');
  const currencyWatcher = form.watch('currency');

  useEffect(() => {
    setSymbol(currencySymbols[currencyWatcher] || '$');
  }, [currencyWatcher]);

  const onSubmit = (data: FormData) => {
    let balance = data.principal;
    const dailyInterestRate = data.dailyInterest / 100;
    const reinvestRate = data.reinvest / 100;
    const startDate = startOfDay(new Date());
    let endDate: Date;

    switch (data.durationUnit) {
      case 'days':
        endDate = addDays(startDate, data.durationValue);
        break;
      case 'weeks':
        endDate = addDays(startDate, data.durationValue * 7);
        break;
      case 'months':
        endDate = addMonths(startDate, data.durationValue);
        break;
      case 'years':
        endDate = addMonths(startDate, data.durationValue * 12);
        break;
    }

    const totalDays = differenceInDays(endDate, startDate);
    const newResults: CalculationResult[] = [];
    let totalDeposits = data.principal;
    let totalWithdrawals = 0;

    for (let i = 0; i <= totalDays; i++) {
      const currentDate = addDays(startDate, i);
      const dayOfWeek = currentDate.getDay();

      let dailyDeposits = 0;
      let dailyWithdrawals = 0;
      let interest = 0;

      // One-time top-off
      if (data.oneTimeTopOffDate && differenceInDays(startOfDay(data.oneTimeTopOffDate), currentDate) === 0) {
        const topOff = data.oneTimeTopOff || 0;
        balance += topOff;
        dailyDeposits += topOff;
        totalDeposits += topOff;
      }

      // Monthly contribution
      if (currentDate.getDate() === 1 && i > 0) {
        const contribution = data.monthlyContributionValue || 0;
        if (data.monthlyContributionType === 'deposit') {
          balance += contribution;
          dailyDeposits += contribution;
          totalDeposits += contribution;
        } else if (data.monthlyContributionType === 'withdrawal') {
          balance -= contribution;
          dailyWithdrawals += contribution;
          totalWithdrawals += contribution;
        }
      }

      // Calculate interest
      if (data.daysOfWeek?.includes(dayOfWeek)) {
        interest = balance * dailyInterestRate;
        const reinvestAmount = interest * reinvestRate;
        balance += reinvestAmount;
      }

      newResults.push({
        date: format(currentDate, 'yyyy-MM-dd'),
        dayOfWeek: format(currentDate, 'EEE'),
        deposits: dailyDeposits,
        withdrawals: dailyWithdrawals,
        interest,
        balance,
      });
    }

    const totalInterest = newResults.reduce((acc, r) => acc + r.interest, 0);
    setResults(newResults);
    setSummary({
      totalPrincipal: totalDeposits,
      totalInterest,
      finalBalance: balance,
      startDate,
      endDate,
    });
  };

  const downloadCSV = () => {
    if (results.length === 0) return;

    let csvContent = 'Date,Day,Deposits,Withdrawals,Interest,Balance\n';
    results.forEach(row => {
      const values = [row.date, row.dayOfWeek, row.deposits, row.withdrawals, row.interest, row.balance];
      csvContent += values.map(v => typeof v === 'number' ? v.toFixed(2) : v).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'earnings_projection.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getBreakdown = (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    if (!results.length) return [];
    
    const grouped: { [key: string]: CalculationResult[] } = {};

    results.forEach(res => {
      let key = '';
      switch (period) {
        case 'daily': key = res.date; break;
        case 'weekly': key = format(new Date(res.date), 'yyyy-ww'); break;
        case 'monthly': key = format(new Date(res.date), 'yyyy-MM'); break;
        case 'yearly': key = format(new Date(res.date), 'yyyy'); break;
      }
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(res);
    });

    return Object.entries(grouped).map(([key, group]) => {
      const last = group[group.length - 1];
      const periodLabel = period === 'daily' ? key : 
                         period === 'weekly' ? `${key.split('-')[0]} W${key.split('-')[1]}`:
                         period === 'monthly' ? format(new Date(key), 'yyyy-MM') : key;

      return {
        date: periodLabel,
        dayOfWeek: last.dayOfWeek,
        deposits: group.reduce((sum, r) => sum + r.deposits, 0),
        withdrawals: group.reduce((sum, r) => sum + r.withdrawals, 0),
        interest: group.reduce((sum, r) => sum + r.interest, 0),
        balance: last.balance,
      };
    });
  };

  const dailyBreakdown = getBreakdown('daily');
  const weeklyBreakdown = getBreakdown('weekly');
  const monthlyBreakdown = getBreakdown('monthly');
  const yearlyBreakdown = getBreakdown('yearly');
  
  return (
    <div className="space-y-6 p-4 lg:p-6 bg-muted/20 rounded-lg">
      <Card>
        <CardHeader>
          <CardTitle>Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.keys(currencySymbols).map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="principal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Principal Investment</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="dailyInterest"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily Interest %</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="durationValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Duration</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="durationUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>&nbsp;</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="days">Days</SelectItem>
                          <SelectItem value="weeks">Weeks</SelectItem>
                          <SelectItem value="months">Months</SelectItem>
                          <SelectItem value="years">Years</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="daysOfWeek"
                render={() => (
                  <FormItem>
                    <FormLabel>Interest calculation days</FormLabel>
                    <div className="flex flex-wrap gap-4">
                      {weekDays.map((day) => (
                        <FormField
                          key={day.id}
                          control={form.control}
                          name="daysOfWeek"
                          render={({ field }) => (
                            <FormItem key={day.id} className="flex flex-row items-start space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(day.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), day.id])
                                      : field.onChange(field.value?.filter((value) => value !== day.id));
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">{day.label}</FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reinvest"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily Reinvest %</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="monthlyContributionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Contributions</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="deposit">Deposit</SelectItem>
                          <SelectItem value="withdrawal">Withdrawal</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="monthlyContributionValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>&nbsp;</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          disabled={form.watch('monthlyContributionType') === 'none'}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="oneTimeTopOff"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>One Time Top Off</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="oneTimeTopOffDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Top Off Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal bg-card',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 !mt-6">
                <Button type="submit" className="w-full">
                  Calculate
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    form.reset(defaultValues);
                    setResults([]);
                    setSummary(null);
                  }}
                >
                  Reset
                </Button>
              </div>

            </form>
          </Form>
          <Alert className="mt-6 bg-card border-border">
            <Info className="h-4 w-4" />
            <AlertTitle>Disclaimer</AlertTitle>
            <AlertDescription>
              This calculator is for illustrative purposes only. The results are based on the inputs provided and do not represent guaranteed returns. This does not constitute financial advice.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
      
      {summary ? (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 text-center">
              <div className="bg-card p-4 rounded-lg border">
                <h3 className="text-sm text-muted-foreground">Principal & Deposits</h3>
                <p className="text-xl font-bold">{symbol}{(summary.totalPrincipal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-card p-4 rounded-lg border">
                <h3 className="text-sm text-muted-foreground">Interest Earnings</h3>
                <p className="text-xl font-bold text-green-600">{symbol}{(summary.totalInterest).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-card p-4 rounded-lg border">
                <h3 className="text-sm text-muted-foreground">Final Balance</h3>
                <p className="text-xl font-bold">{symbol}{(summary.finalBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
            <div className='text-center mb-4 text-sm text-muted-foreground'>
               Projection from {summary.startDate && format(summary.startDate, 'PPP')} to {summary.endDate && format(summary.endDate, 'PPP')}
            </div>
            
            <Tabs defaultValue="daily" value={activeTab} onValueChange={setActiveTab}>
                <div className='flex flex-col sm:flex-row justify-between items-center gap-2'>
                    <h3 className="text-lg font-semibold capitalize">{activeTab} Breakdown</h3>
                    <div className="flex items-center gap-2">
                        <TabsList>
                            <TabsTrigger value="daily">Daily</TabsTrigger>
                            <TabsTrigger value="weekly">Weekly</TabsTrigger>
                            <TabsTrigger value="monthly">Monthly</TabsTrigger>
                            <TabsTrigger value="yearly">Yearly</TabsTrigger>
                        </TabsList>
                        <Button variant="outline" size="sm" onClick={downloadCSV}>
                            <Download className="mr-2 h-4 w-4" />
                            CSV
                        </Button>
                    </div>
                </div>
                <div className="mt-2">
                    <TabsContent value="daily" className="m-0"><BreakdownTable data={dailyBreakdown} symbol={symbol} /></TabsContent>
                    <TabsContent value="weekly" className="m-0"><BreakdownTable data={weeklyBreakdown} symbol={symbol} period="Week" /></TabsContent>
                    <TabsContent value="monthly" className="m-0"><BreakdownTable data={monthlyBreakdown} symbol={symbol} period="Month" /></TabsContent>
                    <TabsContent value="yearly" className="m-0"><BreakdownTable data={yearlyBreakdown} symbol={symbol} period="Year" /></TabsContent>
                </div>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <Card className="flex items-center justify-center h-48 text-muted-foreground bg-background/50">
          <p>Enter your details and click Calculate to see your projection.</p>
        </Card>
      )}
    </div>
  );
}

function BreakdownTable({ data, symbol, period = 'Date' }: { data: CalculationResult[], symbol: string, period?: string }) {
    return (
      <div className="overflow-x-auto">
        <Table>
            <TableHeader>
                <TableRow>
                <TableHead>{period}</TableHead>
                {period === 'Date' && <TableHead>Day</TableHead>}
                <TableHead className='text-right'>Deposits</TableHead>
                <TableHead className='text-right'>Withdrawals</TableHead>
                <TableHead className='text-right'>Interest</TableHead>
                <TableHead className='text-right'>Balance</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map(row => (
                <TableRow key={row.date}>
                    <TableCell>{row.date}</TableCell>
                    {period === 'Date' && <TableCell>{row.dayOfWeek}</TableCell>}
                    <TableCell className='text-right'>{symbol}{row.deposits.toFixed(2)}</TableCell>
                    <TableCell className='text-right text-red-500'>{symbol}{row.withdrawals.toFixed(2)}</TableCell>
                    <TableCell className='text-right text-green-600'>{symbol}{row.interest.toFixed(2)}</TableCell>
                    <TableCell className='text-right font-medium'>{symbol}{row.balance.toFixed(2)}</TableCell>
                </TableRow>
                ))}
            </TableBody>
        </Table>
      </div>
    );
}