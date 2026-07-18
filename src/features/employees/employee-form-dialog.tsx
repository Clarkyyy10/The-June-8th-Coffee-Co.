"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStore, type EmployeeInput } from "@/lib/store";
import type { Employee, Role } from "@/lib/types";

const ROLES: Role[] = ["OWNER", "MANAGER", "CASHIER", "BARISTA", "KITCHEN"];

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  role: z.enum(["OWNER", "MANAGER", "CASHIER", "BARISTA", "KITCHEN"]),
  phone: z.string().min(4, "Phone is required"),
});

type FormValues = z.infer<typeof schema>;

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export function EmployeeFormDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: Employee | null;
}) {
  const addEmployee = useStore((s) => s.addEmployee);
  const updateEmployee = useStore((s) => s.updateEmployee);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", role: "CASHIER", phone: "" },
  });

  useEffect(() => {
    if (!open) return;
    if (editing) {
      reset({
        name: editing.name,
        email: editing.email,
        role: editing.role,
        phone: editing.phone,
      });
    } else {
      reset({ name: "", email: "", role: "CASHIER", phone: "" });
    }
  }, [open, editing, reset]);

  const onSubmit = (values: FormValues) => {
    if (editing) {
      updateEmployee(editing.id, values);
      toast.success(`${values.name} updated`);
    } else {
      const input: EmployeeInput = values;
      addEmployee(input);
      toast.success(`${values.name} added to the team`);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Employee" : "Add Employee"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Update this team member's details."
              : "Add a new team member. They appear on the roster immediately."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Name" error={errors.name?.message}>
            <Input {...register("name")} placeholder="Juan Dela Cruz" />
          </Field>

          <Field label="Email" error={errors.email?.message}>
            <Input {...register("email")} type="email" placeholder="juan@june8.co" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Role" error={errors.role?.message}>
              <select
                {...register("role")}
                className="flex h-10 w-full rounded-lg border border-input bg-card/60 px-3 text-sm outline-none focus-visible:border-caramel"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.charAt(0) + r.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Phone" error={errors.phone?.message}>
              <Input {...register("phone")} placeholder="+63 917 000 0000" />
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{editing ? "Save Changes" : "Add Employee"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
