"use client";

import React from 'react';
import { BarChart, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

const Reports = () => {
  // Placeholder data
  const availableReports = [
    { id: 1, name: "تقرير الحضور الشهري", description: "ملخص حضور الطلاب لكل شهر.", type: "attendance" },
    { id: 2, name: "تحليل اتجاهات الدرجات", description: "تتبع أداء الطلاب بمرور الوقت.", type: "grades" },
    { id: 3, name: "ملخص مالي سنوي", description: "نظرة عامة على الإيرادات والمصروفات السنوية.", type: "finance" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-1 text-center pt-6">
        <h3 className="text-2xl font-bold tracking-tight">
          التقارير والإحصاءات
        </h3>
        <p className="text-sm text-muted-foreground">
          توليد وعرض التقارير التحليلية لأداء المدرسة.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>التقارير المتاحة</CardTitle>
          <CardDescription>اختر تقريراً لتوليده أو عرضه.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم التقرير</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead className="text-center">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availableReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.name}</TableCell>
                    <TableCell>{report.description}</TableCell>
                    <TableCell className="text-center">
                      <Button variant="outline" size="sm" className="mr-2">
                        <FileText className="h-4 w-4 mr-2" /> عرض
                      </Button>
                      <Button variant="default" size="sm">
                        <Download className="h-4 w-4 mr-2" /> تصدير (PDF/Excel)
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>تقارير مخصصة</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            يمكنك طلب تقارير مخصصة من مساعد الذكاء الاصطناعي.
          </p>
          <Button variant="outline" className="mt-4">
            <BarChart className="h-4 w-4 mr-2" /> طلب تقرير من الذكاء الاصطناعي
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;