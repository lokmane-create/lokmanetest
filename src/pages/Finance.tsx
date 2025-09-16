"use client";

import React from 'react';
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
import { format } from 'date-fns';

const Finance = () => {
  // Using generated demo data
  const recentTransactions = demoData.financeTransactions.slice(0, 5); // Show first 5 for recent
  const allTransactions = demoData.financeTransactions;

  const totalRevenue = allTransactions
    .filter(t => t.type === "رسوم دراسية" && t.status === "مدفوع")
    .reduce((sum, t) => sum + parseFloat(t.amount.replace(' ر.س', '')), 0);

  const totalExpenses = allTransactions
    .filter(t => t.type !== "رسوم دراسية" && t.status === "مدفوع")
    .reduce((sum, t) => sum + parseFloat(t.amount.replace(' ر.س', '')), 0);

  const pendingPayments = allTransactions
    .filter(t => t.status === "معلق")
    .reduce((sum, t) => sum + parseFloat(t.amount.replace(' ر.س', '')), 0);
  const pendingCount = allTransactions.filter(t => t.status === "معلق").length;

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
            <div className="text-2xl font-bold">{totalRevenue.toLocaleString('ar-SA')} ر.س</div>
            <p className="text-xs text-muted-foreground">+10% عن الشهر الماضي</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExpenses.toLocaleString('ar-SA')} ر.س</div>
            <p className="text-xs text-muted-foreground">+5% عن الشهر الماضي</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المدفوعات المعلقة</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments.toLocaleString('ar-SA')} ر.س</div>
            <p className="text-xs text-muted-foreground">{pendingCount} فواتير معلقة</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>المعاملات الأخيرة</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" /> تصدير (CSV)
            </Button>
            <Button variant="default" size="sm">
              <PlusCircle className="mr-2 h-4 w-4" /> إضافة معاملة
            </Button>
          </div>
        </CardHeader>
        <CardContent>
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
                {recentTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.type}</TableCell>
                    <TableCell>{transaction.amount}</TableCell>
                    <TableCell>
                      {transaction.date && !isNaN(new Date(transaction.date).getTime())
                        ? format(new Date(transaction.date), 'PPP')
                        : 'N/A'}
                    </TableCell>
                    <TableCell>{transaction.status}</TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="sm">عرض</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>التقارير المالية</CardTitle>
          <Button variant="outline" size="sm">
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