<script setup lang="ts">
import {
  LayoutDashboard, Pill, Tags, Package, Factory, FileText,
  Users, TrendingUp, User, Settings, Building2, DollarSign,
  AlertTriangle, AlertCircle, Pencil, Trash2, Eye,
  Printer, X, ChevronDown, ChevronUp, Search, Plus,
} from '@lucide/vue'
import type { Component } from 'vue'

defineProps<{ name: string; size?: number }>()

const iconMap: Record<string, Component> = {
  LayoutDashboard, Pill, Tags, Package, Factory, FileText,
  Users, TrendingUp, User, Settings, Building2, DollarSign,
  AlertTriangle, AlertCircle, Pencil, Trash2, Eye,
  Printer, X, ChevronDown, ChevronUp, Search, Plus,
}
</script>

<template>
  <component :is="iconMap[name]" :size="size ?? 18" />
</template>
