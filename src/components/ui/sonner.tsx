import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-base-100 group-[.toaster]:text-base-content group-[.toaster]:border-base-300 group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-base-content/70',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-content',
          cancelButton: 'group-[.toast]:bg-base-200 group-[.toast]:text-base-content',
          success: 'group-[.toaster]:border-success group-[.toaster]:text-success',
          error: 'group-[.toaster]:border-error group-[.toaster]:text-error',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
