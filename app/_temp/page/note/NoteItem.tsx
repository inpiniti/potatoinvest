"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React, { useState } from "react";

const NoteItem = ({
  title,
  date,
  content,
}: {
  title: string;
  date: string;
  content: React.ReactNode;
}) => {
  const [toggle, setToggle] = useState(false);

  return (
    <Card onClick={() => setToggle(!toggle)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{date}</CardDescription>
      </CardHeader>
      {toggle && (
        <CardContent
          className="grid gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center space-x-4 rounded-md bg-neutral-100 p-4">
            <div className="flex-1 space-y-1">
              <p className="font-medium text-muted-foreground">{content}</p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
export default NoteItem;
