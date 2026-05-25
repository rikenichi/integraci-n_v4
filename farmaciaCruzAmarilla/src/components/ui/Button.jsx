export default function Button({
  variant = 'primary',
  size,
  block,
  loading,
  disabled,
  children,
  className = '',
  ...rest
}) {
  const classes = [
    'btn',
    `btn-${variant}`,
    size ? `btn-${size}` : '',
    block ? 'btn-block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={classes} disabled={disabled || loading} {...rest}>
      {loading && <span className="spinner spinner-inline" aria-hidden="true" />}
      {children}
    </button>
  )
}
