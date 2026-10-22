import type { Dictionary } from '@/i18n/dictionaries'
import { Section } from '../Section'
import styles from './sections.module.css'

interface ProcessProps {
  dict: Dictionary['process']
}

/** The swarm, comb and jar steps. Phase 4 adds the particle morph behind them. */
export function Process({ dict }: ProcessProps) {
  const steps = [dict.steps.swarm, dict.steps.comb, dict.steps.jar]
  return (
    <Section id="process" labelledBy="process-title" className={styles.section}>
      <h2 id="process-title">{dict.title}</h2>
      <p className={styles.lead}>{dict.intro}</p>
      <ol className={styles.steps}>
        {steps.map((step) => (
          <li key={step.title}>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  )
}
