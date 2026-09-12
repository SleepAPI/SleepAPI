/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * @author Vuetify
 */
export type SelectItemKey<T> = keyof T | (string & {});
export type HeaderCellProps = Record<string, any>;
export type FilterMatch = boolean | number | [number, number] | [number, number][];
export interface InternalItem<T = any> {
  value: any;
  raw: T;
}
export type FilterFunction = (value: string, query: string, item?: InternalItem) => FilterMatch;
export type DataTableCompareFunction<T = any> = (a: T, b: T) => number | null;

export type DataTableHeader<T = Record<string, any>> = {
  key?: 'data-table-group' | 'data-table-select' | 'data-table-expand' | (string & {});
  value?: SelectItemKey<T>;
  title?: string;
  fixed?: boolean;
  align?: 'start' | 'end' | 'center';
  width?: number | string;
  minWidth?: string;
  maxWidth?: string;
  nowrap?: boolean;
  headerProps?: Record<string, any>;
  cellProps?: HeaderCellProps;
  sortable?: boolean;
  sort?: DataTableCompareFunction;
  sortRaw?: DataTableCompareFunction;
  filter?: FilterFunction;
  mobile?: boolean;
  children?: DataTableHeader<T>[];
};
