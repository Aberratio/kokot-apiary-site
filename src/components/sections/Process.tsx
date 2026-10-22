import { KineticText, QualityGate } from 'web-studio-kit'
import type { Dictionary } from '@/i18n/dictionaries'
import { HoneycombIllustration } from '../process/HoneycombIllustration'
import { ProcessScene } from '../process/ProcessScene'
import { Section } from '../Section'
import styles from './sections.module.css'

interface ProcessProps {
  dict: Dictionary['process']
}

/**
 * The swarm, comb and jar steps scroll past a sticky stage where particles morph through the
 * same three shapes. In light mode the stage shows a static honeycomb.
 */
export function Process({ dict }: ProcessProps) {
  const steps = [dict.steps.swarm, dict.steps.comb, dict.steps.jar]
  return (
    <Section id="process" labelledBy="process-title" className={styles.section}>
      <KineticText as="h2" id="process-title">
        {dict.title}
      </KineticText>
      <p className={styles.lead}>{dict.intro}</p>
      <div className={styles.processLayout}>
        <div className={styles.stage}>
          <QualityGate className={styles.stageInner} fallback={<HoneycombIllustration />}>
            <ProcessScene />
          </QualityGate>
        </div>
        <ol className={styles.processSteps}>
          {steps.map((step, index) => (
            <li key={step.title}>
              <span className={styles.stepNumber}>{String(index + 1).padStart(2, '0')}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  )
}
