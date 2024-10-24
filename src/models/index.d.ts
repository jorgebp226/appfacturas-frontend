import { ModelInit, MutableModel, __modelMeta__, ManagedIdentifier } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled } from "@aws-amplify/datastore";





type EagerInvoice = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Invoice, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly itemName?: string | null;
  readonly totalPrice?: number | null;
  readonly issueDate?: string | null;
  readonly category?: string | null;
  readonly subcategory?: string | null;
  readonly vendor?: string | null;
  readonly invoiceNumber?: string | null;
  readonly uploadDate?: string | null;
  readonly fileType?: string | null;
  readonly originalFile?: string | null;
  readonly status?: string | null;
  readonly userId: string;
  readonly balanceDue?: number | null;
  readonly dueDate?: string | null;
  readonly associatedProject?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyInvoice = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Invoice, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly itemName?: string | null;
  readonly totalPrice?: number | null;
  readonly issueDate?: string | null;
  readonly category?: string | null;
  readonly subcategory?: string | null;
  readonly vendor?: string | null;
  readonly invoiceNumber?: string | null;
  readonly uploadDate?: string | null;
  readonly fileType?: string | null;
  readonly originalFile?: string | null;
  readonly status?: string | null;
  readonly userId: string;
  readonly balanceDue?: number | null;
  readonly dueDate?: string | null;
  readonly associatedProject?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Invoice = LazyLoading extends LazyLoadingDisabled ? EagerInvoice : LazyInvoice

export declare const Invoice: (new (init: ModelInit<Invoice>) => Invoice) & {
  copyOf(source: Invoice, mutator: (draft: MutableModel<Invoice>) => MutableModel<Invoice> | void): Invoice;
}