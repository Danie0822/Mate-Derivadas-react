export default function Card({ children, className = '', ...props }) {
  const baseClasses = 'bg-white rounded-lg shadow-md border border-gray-200';
  const classes = `${baseClasses} ${className}`;
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  const classes = `px-6 py-4 border-b border-gray-200 ${className}`;
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = '', ...props }) {
  const classes = `px-6 py-4 ${className}`;
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  const classes = `px-6 py-4 border-t border-gray-200 ${className}`;
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
