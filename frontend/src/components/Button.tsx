import classNames from 'classnames';
import React, { ButtonHTMLAttributes, DetailedHTMLProps, PropsWithChildren } from 'react';

export type ButtonProps = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

export type Props = PropsWithChildren<ButtonProps>;

export const Button: React.FC<Props> = ({
  children,
  className,
  onClick,
  ...rest
}) => {
  const classes = classNames(
    'bg-purple-900 transition ease-in-out px-6 py-2 border-none disabled:text-opacity-70 text-base tracking-wide',
    'font-semibold rounded-full disabled:opacity-50 hover:bg-opacity-90 disabled:hover:bg-opacity-50 hover:bg-purple-800',
    'focus:ring-none disabled:cursor-not-allowed focus:outline-none focus:ring-0 focus:ring-offset-0',
    className,
  );

  return (
    <button className={classes} onClick={onClick} {...rest}>
      {children}
    </button>
  );
};