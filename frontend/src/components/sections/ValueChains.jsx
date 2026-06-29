import { Beef, Droplets, Rabbit, Milk } from 'lucide-react';
import './ValueChains.css';

const CHAINS = [
  {
    icon: Beef,
    label: 'Cattle (Beef)',
    color: '#c49a3e',
    bg: 'rgba(196,154,62,0.10)',
    title: 'Cattle Beef Value Chain',
    desc: 'The beef value chain plays an important role in meeting the growing demand for quality meat products while supporting livestock producers, traders, processors, and marketers. The project supports initiatives aimed at improving productivity, animal health, feed availability, market access, and value addition within the beef sector.',
    tags: ['Breed Improvement', 'Fattening', 'Animal Health', 'Market Access'],
  },
  {
    icon: Milk,
    label: 'Cattle (Dairy)',
    color: '#0891b2',
    bg: 'rgba(8,145,178,0.10)',
    title: 'Cattle Dairy Value Chain',
    desc: 'The dairy value chain offers significant opportunities for increased milk production, value addition, and income generation. The project promotes interventions that enhance dairy production systems, improve access to services, and strengthen opportunities for commercialisation across Kwara State.',
    tags: ['Milk Collection', 'Cold Chain', 'Processing', 'Commercialisation'],
  },
  {
    icon: Rabbit,
    label: 'Sheep',
    color: '#7c3aed',
    bg: 'rgba(124,58,237,0.10)',
    title: 'Sheep Value Chain',
    desc: 'Sheep production contributes to household income, food security, and livestock-based livelihoods across many communities in Kwara State. The project supports improved production practices, animal health management, and access to market opportunities within the sheep value chain.',
    tags: ['Production', 'Animal Health', 'Market Access', 'Livelihoods'],
  },
  {
    icon: Droplets,
    label: 'Goats',
    color: '#16a34a',
    bg: 'rgba(22,163,74,0.10)',
    title: 'Goat Value Chain',
    desc: 'Goat production remains an important livelihood activity for many rural households, particularly women and smallholder livestock producers. The project promotes interventions that improve productivity, strengthen resilience, and expand market opportunities for goat producers across the state.',
    tags: ['Smallholder Support', 'Resilience', 'Women & Youth', 'Market Linkages'],
  },
];

export default function ValueChains() {
  return (
    <section className="vc section" id="value-chains">
      <div className="container">
        <div className="vc__header text-center">
          <span className="section-label">Strategic Focus</span>
          <h2 className="section-title">Priority Value Chains.</h2>
          <p className="section-subtitle mx-auto text-center">
            Kwara L-PRES focuses on livestock value chains with significant potential to improve livelihoods,
            strengthen food security, and drive economic growth.
          </p>
        </div>

        <div className="vc__grid">
          {CHAINS.map((chain) => (
            <div key={chain.label} className="vc__card" style={{ '--vc': chain.color, '--vb': chain.bg }}>
              <div className="vc__card-top">
                <div className="vc__icon">
                  <chain.icon size={24} />
                </div>
                <span className="vc__label">{chain.label}</span>
              </div>
              <h3 className="vc__title">{chain.title}</h3>
              <p className="vc__desc">{chain.desc}</p>
              <div className="vc__tags">
                {chain.tags.map(t => <span key={t} className="vc__tag">{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
