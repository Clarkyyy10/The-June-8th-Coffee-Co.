"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { EmployeeFormDialog } from "@/features/employees/employee-form-dialog";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/lib/hooks";
import { useCurrentUser } from "@/lib/user-context";
import { can } from "@/lib/rbac";
import type { Employee, Role } from "@/lib/types";
import { formatCompactCurrency, initials } from "@/lib/utils";
import { Plus, Phone, Mail, Pencil, Trash2 } from "lucide-react";

const roleStyles: Record<Role, string> = {
  OWNER: "default",
  MANAGER: "caramel",
  CASHIER: "info",
  BARISTA: "success",
  KITCHEN: "warning",
};

export default function EmployeesPage() {
  const hydrated = useHydrated();
  const employees = useStore((s) => s.employees);
  const deleteEmployee = useStore((s) => s.deleteEmployee);

  const user = useCurrentUser();
  const canManage = user ? can(user.role, "employees.manage") : false;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Employee | null>(null);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (e: Employee) => {
    setEditing(e);
    setFormOpen(true);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteEmployee(pendingDelete.id);
    toast.success(`${pendingDelete.name} removed from the team`);
    setPendingDelete(null);
  };

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-6 h-9 w-48 rounded-lg skeleton" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-52 rounded-xl skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader title="Employees" description="Staff, roles, performance, and attendance">
        {canManage && (
          <Button size="sm" onClick={openAdd}>
            <Plus className="h-4 w-4" /> Add Employee
          </Button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {employees.map((e, i) => (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ y: -4 }}
          >
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-xl font-semibold text-cream"
                      style={{ background: e.avatarColor }}
                    >
                      {initials(e.name)}
                    </span>
                    <div>
                      <p className="font-medium">{e.name}</p>
                      <Badge variant={roleStyles[e.role] as never} className="mt-1">
                        {e.role.charAt(0) + e.role.slice(1).toLowerCase()}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {canManage && (
                      <>
                        <button
                          type="button"
                          onClick={() => openEdit(e)}
                          aria-label={`Edit ${e.name}`}
                          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {e.role !== "OWNER" && (
                          <button
                            type="button"
                            onClick={() => setPendingDelete(e)}
                            aria-label={`Remove ${e.name}`}
                            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </>
                    )}
                    <span
                      className={`ml-1 h-2.5 w-2.5 rounded-full ${
                        e.active ? "bg-success" : "bg-muted-foreground/40"
                      }`}
                      title={e.active ? "Active" : "Inactive"}
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" /> {e.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" /> {e.phone}
                  </p>
                </div>

                {e.role !== "OWNER" && (
                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3 text-center">
                    <div>
                      <p className="font-display text-sm font-bold text-caramel-dark">
                        {formatCompactCurrency(e.sales)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Sales</p>
                    </div>
                    <div>
                      <p className="font-display text-sm font-bold">{e.ordersHandled}</p>
                      <p className="text-[10px] text-muted-foreground">Orders</p>
                    </div>
                    <div>
                      <p className="font-display text-sm font-bold text-success">
                        {e.attendance}%
                      </p>
                      <p className="text-[10px] text-muted-foreground">Attend.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {canManage && (
        <EmployeeFormDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} />
      )}

      <Dialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove employee?</DialogTitle>
            <DialogDescription>
              This removes{" "}
              <span className="font-medium text-foreground">{pendingDelete?.name}</span> from
              the team. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Remove
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
