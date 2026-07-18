"use client";

import { motion } from "framer-motion";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, profitMargin } from "@/lib/utils";
import { MoreVertical, Pencil, Star, Copy, Trash2 } from "lucide-react";

interface ProductCardProps {
  product: Product;
  index?: number;
  onEdit?: (p: Product) => void;
  onDuplicate?: (p: Product) => void;
  onDelete?: (p: Product) => void;
}

export function ProductCard({
  product,
  index = 0,
  onEdit,
  onDuplicate,
  onDelete,
}: ProductCardProps) {
  const lowStock = product.stock <= product.lowStockAlert;
  const margin = profitMargin(product.price, product.cost);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.03, duration: 0.35 }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-card transition-shadow hover:shadow-float"
    >
      <div className="relative flex h-32 items-center justify-center overflow-hidden bg-cream-radial">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <motion.span
            className="text-6xl drop-shadow-sm"
            whileHover={{ scale: 1.15, rotate: -6 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            {product.emoji}
          </motion.span>
        )}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.bestSeller && (
            <Badge variant="default" className="h-5 gap-1 px-1.5 text-[10px]">
              <Star className="h-2.5 w-2.5 fill-current" /> Best Seller
            </Badge>
          )}
          {product.seasonal && (
            <Badge variant="warning" className="h-5 px-1.5 text-[10px]">
              Seasonal
            </Badge>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-card/70 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onEdit?.(product)}>
              <Pencil /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onDuplicate?.(product)}>
              <Copy /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => onDelete?.(product)}
              className="text-danger focus:bg-danger/10 [&_svg]:text-danger"
            >
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium">{product.name}</p>
            <p className="text-xs text-muted-foreground">{product.sku}</p>
          </div>
          <p className="shrink-0 font-display font-semibold text-caramel-dark">
            {formatCurrency(product.price)}
          </p>
        </div>

        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
          {product.description}
        </p>

        <div className="mt-3 flex items-center justify-between text-xs">
          <span className={lowStock ? "font-medium text-danger" : "text-muted-foreground"}>
            {lowStock ? "Low: " : "Stock: "}
            {product.stock}
          </span>
          <span className="text-success">{margin.toFixed(0)}% margin</span>
        </div>

        <div className="mt-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Button variant="subtle" size="sm" className="flex-1" onClick={() => onEdit?.(product)}>
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
