import styles from "./Form.module.scss";

type Props = {
  label: string;
  options: { label: string; value: string }[];
  error?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ label, options, error, id, ...props }: Props) {
  const inputId = id || props.name || label;

  return (
    <label className={styles.field} htmlFor={inputId}>
      <span className={styles.label}>{label}</span>
      <select className={styles.control} id={inputId} aria-invalid={Boolean(error)} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <span className={styles.error}>{error}</span> : null}
    </label>
  );
}
