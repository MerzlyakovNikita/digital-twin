import { useStore } from '../store/useStore';
import { getRange } from '../config/ranges';

export const InputNode = ({ id, label }: any) => {
  const value = useStore((s) => s.values[id]);
  const setValue = useStore((s) => s.setValue);

  const range = getRange(id);

  const handleChange = (val: number) => {
    const clamped = Math.min(range.max, Math.max(range.min, val));
    setValue(id, clamped);
  };

  return (
    <div style={styles.container}>
      <label style={styles.label}>{label}</label>

      <div style={styles.row}>
        <input
          type="number"
          value={value}
          min={range.min}
          max={range.max}
          step={range.step}
          onChange={(e) => handleChange(Number(e.target.value))}
          style={styles.input}
        />

        <input
          type="range"
          value={value}
          min={range.min}
          max={range.max}
          step={range.step}
          onChange={(e) => handleChange(Number(e.target.value))}
          style={styles.slider}
        />
      </div>

      <div style={styles.hint}>
        {range.min} — {range.max}
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: 60,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
  },

  label: {
    fontSize: 14,
    marginBottom: 4,
    display: 'block',
  },

  row: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },

  input: {
    width: 100,
  },

  slider: {
    flex: 1,
  },

  hint: {
    fontSize: 11,
    color: '#6b7280',
  },
};