import { Link } from 'react-router-dom';

const variantClasses = {
  primary: 'bg-zinc-900 font-poppins text-zinc-50 hover:bg-zinc-700',
  secondary: 'bg-zinc-50 font-poppins text-zinc-900 hover:bg-zinc-200',
  tertiary: 'bg-[#35408f] font-poppins text-[#ffd41d] hover:bg-[#2c3578]',
};

const Button = ({
  children,
  to,
  type = 'button',
  variant = 'secondary',
  className = '',
  onClick,
}) => {
  const classes = [
    'inline-flex items-center justify-center rounded-full border-2 border-zinc-900 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] transition',
    variantClasses[variant] ?? variantClasses.secondary,
    className,
  ]
    .join(' ')
    .trim();

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
};

export default Button;
