import styles from "./Form.module.scss";

type Props = {
  label: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export function Radio({ label, ...props }: Props) {
  return (
    <label className={styles.choice}>
      <input type="radio" {...props} />
      <span>{label}</span>
    </label>
  );
}
