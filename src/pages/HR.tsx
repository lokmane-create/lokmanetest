"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Users, FileText, DollarSign } from 'lucide-react';
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

const HR = () => {
  // Placeholder data
  const staffMembers = [
    { id: 1, name: "أ. نورة سالم", role: "معلمة رياضيات", contract: "دائم", salary: "3500 ر.س" },
    { id: 2, name: "أ. خالد مراد", role: "معلم علوم", contract: "دائم", salary: "3800 ر.س" },
    { id: 3, name: "السيدة ليلى", role: "إدارية", contract: "مؤقت", salary: "2500 ر.س" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-1 text-center pt-6">
        <h3 className="text-2xl font-bold tracking-tight">
          الموارد البشرية
        </h3>
        <p className="text-sm text-muted-foreground">
          إدارة معلومات الموظفين، الرواتب، والعقود.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الموظفين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25</div>
            <p className="text-xs text-muted-foreground">+2 موظف جديد هذا العام</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عقود نشطة</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">2 عقد ينتهي قريباً</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الرواتب (الشهر)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85,000 ر.س</div>
            <p className="text-xs text-muted-foreground">يشمل جميع الموظفين</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>قائمة الموظفين</CardTitle>
          <Button variant="outline" size="sm">
            <PlusCircle className="mr-2 h-4 w-4" /> إضافة موظف
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>الدور</TableHead>
                  <TableHead>نوع العقد</TableHead>
                  <TableHead>الراتب</TableHead>
                  <TableHead className="text-center">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.name}</TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell>{member.contract}</TableCell>
                    <TableCell>{member.salary}</TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="sm">عرض</Button>
                      <Button variant="ghost" size="sm">تحرير</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HR;