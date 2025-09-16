"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText, DollarSign, BarChart } from 'lucide-react';
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

const Finance = () => {
  // Placeholder data
  const recentTransactions = [
    { id: 1, type: "رسوم دراسية", amount: "5000 ر.س", date: "2024-09-01", status: "مدفوع" },
    { id: 2, type: "راتب معلم", amount: "3500 ر.س", date: "2024-09-05", status: "مدفوع" },
    { id: 3, type: "مستلزمات مكتبية", amount: "250 ر.س", date: "2024-09-07", status: "مدفوع" },
    { id: 4, type: "رسوم دراسية", amount: "5000 ر.س", date: "2024-09-10", status: "معلق" },
  ];

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
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات (الشهر)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">50,000 ر.س</div>
            <p className="text-xs text-muted-foreground">+10% عن الشهر الماضي</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المصروفات (الشهر)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32,000 ر.س</div>
            <p className="text-xs text-muted-foreground">+5% عن الشهر الماضي</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المدفوعات المعلقة</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18,000 ر.س</div>
            <p className="text-xs text-muted-foreground">4 فواتير معلقة</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>المعاملات الأخيرة</CardTitle>
          <Button variant="outline" size="sm">
            <PlusCircle className="mr-2 h-4 w-4" /> إضافة معاملة
          </Button>
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
                    <TableCell>{transaction.date}</TableCell>
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