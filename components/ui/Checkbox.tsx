import styles from "./Form.module.scss";

type Props = {
  label: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export function Checkbox({ label, ...props }: Props) {
  return (
    <label className={styles.choice}>
      <input type="checkbox" {...props} />
      <span>{label}</span>
    </label>
  );
}
