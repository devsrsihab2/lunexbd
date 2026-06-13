import styles from "./Form.module.scss";

type Props = {
  label: string;
  error?: string;
  helpText?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ label, error, helpText, id, ...props }: Props) {
  const inputId = id || props.name || label;

  return (
    <label className={styles.field} htmlFor={inputId}>
      <span className={styles.label}>{label}</span>
      <input className={styles.control} id={inputId} aria-invalid={Boolean(error)} {...props} />
      {helpText ? <span className={styles.help}>{helpText}</span> : null}
      {error ? <span className={styles.error}>{error}</span> : null}
    </label>
  );
}
