"use client";

import { useEffect, useState } from "react";
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
import { ImageUpload } from "./image-upload";
import { seedCategories } from "@/lib/seed";
import { useStore, type ProductInput } from "@/lib/store";
import type { Product } from "@/lib/types";
import { profitMargin } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  sku: z.string().min(2, "SKU is required"),
  category: z.string().min(1, "Select a category"),
  emoji: z.string().optional(),
  description: z.string().max(200).optional(),
  price: z.number().positive("Price must be greater than 0"),
  cost: z.number().min(0, "Cost cannot be negative"),
  stock: z.number().int().min(0),
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

export function ProductFormDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: Product | null;
}) {
  const addProduct = useStore((s) => s.addProduct);
  const updateProduct = useStore((s) => s.updateProduct);

  const [image, setImage] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [hasSizes, setHasSizes] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      sku: "",
      category: "Coffee",
      emoji: "☕",
      description: "",
      price: 0,
      cost: 0,
      stock: 0,
    },
  });

  useEffect(() => {
    if (!open) return;
    if (editing) {
      reset({
        name: editing.name,
        sku: editing.sku,
        category: editing.category,
        emoji: editing.emoji,
        description: editing.description,
        price: editing.price,
        cost: editing.cost,
        stock: editing.stock,
      });
      setImage(editing.image);
      setImages(editing.images);
      setHasSizes(editing.hasSizes);
    } else {
      reset({
        name: "",
        sku: "",
        category: "Coffee",
        emoji: "☕",
        description: "",
        price: 0,
        cost: 0,
        stock: 0,
      });
      setImage("");
      setImages([]);
      setHasSizes(true);
    }
  }, [open, editing, reset]);

  const price = Number(watch("price")) || 0;
  const cost = Number(watch("cost")) || 0;
  const margin = profitMargin(price, cost);

  const onSubmit = (values: FormValues) => {
    const input: ProductInput = {
      name: values.name,
      sku: values.sku,
      category: values.category,
      emoji: values.emoji || "☕",
      description: values.description || "",
      price: values.price,
      cost: values.cost,
      stock: values.stock,
      image,
      images,
      hasSizes,
    };
    if (editing) {
      updateProduct(editing.id, input);
      toast.success(`${values.name} updated everywhere`);
    } else {
      addProduct(input);
      toast.success(`${values.name} added to menu & POS`);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Changes apply across the menu, POS, and reports instantly."
              : "New items appear in the POS and menu immediately."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <ImageUpload
            image={image}
            images={images}
            onChange={(img, imgs) => {
              setImage(img);
              setImages(imgs);
            }}
          />

          <div className="grid grid-cols-[80px_1fr] gap-3">
            <Field label="Icon">
              <Input {...register("emoji")} className="text-center text-xl" maxLength={2} />
            </Field>
            <Field label="Name" error={errors.name?.message}>
              <Input {...register("name")} placeholder="Caramel Macchiato" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="SKU" error={errors.sku?.message}>
              <Input {...register("sku")} placeholder="COF-010" />
            </Field>
            <Field label="Category" error={errors.category?.message}>
              <select
                {...register("category")}
                className="flex h-10 w-full rounded-lg border border-input bg-card/60 px-3 text-sm outline-none focus-visible:border-caramel"
              >
                {seedCategories.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Description" error={errors.description?.message}>
            <Input {...register("description")} placeholder="Short, tasty description" />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Price (₱)" error={errors.price?.message}>
              <Input type="number" step="0.01" {...register("price", { valueAsNumber: true })} />
            </Field>
            <Field label="Cost (₱)" error={errors.cost?.message}>
              <Input type="number" step="0.01" {...register("cost", { valueAsNumber: true })} />
            </Field>
            <Field label="Stock" error={errors.stock?.message}>
              <Input type="number" {...register("stock", { valueAsNumber: true })} />
            </Field>
          </div>

          <label className="flex items-center justify-between rounded-lg border border-border bg-background/40 p-3">
            <span className="text-sm">
              Offer cup sizes
              <span className="ml-1 text-xs text-muted-foreground">
                (uses sizes from Settings)
              </span>
            </span>
            <input
              type="checkbox"
              checked={hasSizes}
              onChange={(e) => setHasSizes(e.target.checked)}
              className="h-4 w-4 accent-[var(--color-caramel)]"
            />
          </label>

          <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Profit margin</span>
            <span
              className={
                margin >= 50 ? "font-semibold text-success" : "font-semibold text-warning"
              }
            >
              {margin.toFixed(1)}%
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{editing ? "Save Changes" : "Add Product"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
