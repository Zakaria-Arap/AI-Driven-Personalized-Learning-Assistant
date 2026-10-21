const LABEL = { not_started: 'Not started', learning: 'Learning', nearly_there: 'Nearly there', mastered: 'Mastered' };
export default function MasteryChip({ band }) { return <span className={`chip ${band}`}>{LABEL[band] || band}</span>; }
