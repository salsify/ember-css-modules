import type { HelperLike } from '@glint/template';

interface Signature {
  Args: {
    Positional: [string];
    Named: {
      from?: string | undefined;
    };
  };
  Return: string;
}

export default interface EmberCssModulesRegistry {
  'local-class': HelperLike<Signature>;
}
