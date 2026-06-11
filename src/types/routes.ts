import type { ReactNode } from 'react';

type BaseRoute = {
  path: string;
  element: ReactNode;
};

type HasChildrenRoute = BaseRoute & {
  children?: Array<HasChildrenRoute>;
};

export type { BaseRoute, HasChildrenRoute };