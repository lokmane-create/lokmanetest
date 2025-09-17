"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText, DollarSign, BarChart, Download } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { demoData } from '@/lib/fakeData'; // Import demo data
import { format, parseISO, isSameMonth } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess } from '@/utils/toast';

const Finance = () => {
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  const allTransactions = demoData.financeTransactions;

  const filteredTransactions = allTransactions.filter(transaction => {
    const matchesType = selectedTypeFilter === 'all' || transaction.type === selectedTypeFilter;
    const matchesStatus = selectedStatusFilter === 'all' || transaction.status === selectedStatusFilter;
    return matchesType && matchesStatus;
  });

  const recentTransactions = filteredTransactions.slice(0, 5); // Show first 5 for recent

  const totalRevenue = filteredTransactions
    .filter(t => t.type === "رسوم دراسية" && t.status === "مدفوع")
    .reduce((sum, t) => sum + parseFloat(t.amount.replace(' د.ج', '')), 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type !== "رسوم دراسية" && t.status === "مدفوع")
    .reduce((sum, t) => sum + parseFloat(t.amount.replace(' د.ج', '')), 0);

  const pendingPayments = filteredTransactions
    .filter(t => t.status === "معلق")
    .reduce((sum, t) => sum + parseFloat(t.amount.replace(' د.ج', '')), 0);
  const pendingCount = filteredTransactions.filter(t => t.status === "معلق").length;

  // Calculate month-over-month change (simplified for demo)
  const currentMonthRevenue = allTransactions
    .filter(t => t.type === "رسوم دراسية" && t.status === "مدفوع" && isSameMonth(parseISO(t.date), new Date()))
    .reduce((sum, t) => sum + parseFloat(t.amount.replace(' د.ج', '')), 0);
  const lastMonthRevenue = allTransactions
    .filter(t => t.type === "رسوم دراسية" && t.status === "مدفوع" && isSameMonth(parseISO(t.date), new Date(new Date().setMonth(new Date().getMonth() - 1))))
    .reduce((sum, t) => sum + parseFloat(t.amount.replace(' د.ج', '')), 0);
  const revenueChange = lastMonthRevenue > 0 ? (((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(0) : 'N/A';

  const currentMonthExpenses = allTransactions
    .filter(t => t.type !== "رسوم دراسية" && t.status === "مدفوع" && isSameMonth(parseISO(t.date), new Date()))
    .reduce((sum, t) => sum + parseFloat(t.amount.replace(' د.ج', '')), 0);
  const lastMonthExpenses = allTransactions
    .filter(t => t.type !== "رسوم دراسية" && t.status === "مدفوع" && isSameMonth(parseISO(t.date), new Date(new Date().setMonth(new Date().getMonth() - 1))))
    .reduce((sum, t) => sum + parseFloat(t.amount.replace(' د.ج', '')), 0);
  const expenseChange = lastMonthExpenses > 0 ? (((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100).toFixed(0) : 'N/A';


  const transactionTypesOptions = Array.from(new Set(demoData.financeTransactions.map(t => t.type)));
  const transactionStatusOptions = Array.from(new Set(demoData.financeTransactions.map(t => t.status)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-1 text-center pt-6">
        <h3 className="text-2xl font-bold tracking-tight">
          المالية
        </h3>
        <p className="text-sm text-muted-foreground">
          إدارة الرسوم، المدفوعات، المصروفات، والتقارير المالية.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toLocaleString('en-US')} د.ج</div>
            <p className="text-xs text-muted-foreground">{revenueChange !== 'N/A' ? (parseFloat(revenueChange) >= 0 ? `+${revenueChange}%` : `${revenueChange}%`) : ''} عن الشهر الماضي</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExpenses.toLocaleString('en-US')} د.ج</div>
            <p className="text-xs text-muted-foreground">{expenseChange !== 'N/A' ? (parseFloat(expenseChange) >= 0 ? `+${expenseChange}%` : `${expenseChange}%`) : ''} عن الشهر الماضي</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المدفوعات المعلقة</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments.toLocaleString('en-US')} د.ج</div>
            <p className="text-xs text-muted-foreground">{pendingCount} فواتير معلقة</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>المعاملات الأخيرة</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => showSuccess("تم تصدير المعاملات كـ CSV (محاكاة).")}>
              <Download className="mr-2 h-4 w-4" /> تصدير (CSV)
            </Button>
            <Button variant="default" size="sm" onClick={() => showSuccess("تم فتح نموذج إضافة معاملة جديدة (محاكاة).")}>
              <PlusCircle className="mr-2 h-4 w-4" /> إضافة معاملة
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <Select onValueChange={setSelectedTypeFilter} value={selectedTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="اختر نوع المعاملة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                {transactionTypesOptions.map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setSelectedStatusFilter} value={selectedStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="اختر الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                {transactionStatusOptions.map(status => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>النوع</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-center">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">لا يوجد معاملات مطابقة.</TableCell>
                  </TableRow>
                ) : (
                  recentTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.type}</TableCell>
                      <TableCell>{parseFloat(transaction.amount.replace(' د.ج', '')).toLocaleString('en-US')} د.ج</TableCell>
                      <TableCell>
                        {transaction.date && !isNaN(new Date(transaction.date).getTime())
                          ? format(new Date(transaction.date), 'PPP')
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{transaction.status}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="sm" onClick={() => showSuccess(`عرض تفاصيل المعاملة ${transaction.id}`)}>عرض</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>التقارير المالية</CardTitle>
          <Button variant="outline" size="sm" onClick={() => showSuccess("تم توليد تقرير مالي (محاكاة).")}>
            <BarChart className="mr-2 h-4 w-4" /> توليد تقرير
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            يمكنك توليد تقارير مفصلة عن الإيرادات والمصروفات، وكشوف الحسابات.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Finance;