import { Link } from 'react-router-dom';
import { Check, Star, Zap } from 'lucide-react';

export default function Pricing() {
  const organizationPlans = [
    {
      name: 'Free',
      price: '$0',
      period: '/forever',
      annual: '',
      description: 'Perfect for small clubs just getting started',
      features: [
        '1 team page',
        'Basic tryout listings',
        'Player messaging',
        'Simple roster management',
        'Calendar integration',
        'Community support',
      ],
      cta: 'Get Started Free',
      popular: false,
    },
    {
      name: 'Starter',
      price: '$19',
      period: '/month',
      annual: '$199/year',
      description: 'For growing clubs with multiple teams',
      features: [
        'Up to 3 team pages',
        'Advanced tryout management',
        'Full messaging system',
        'Roster builder',
        'Calendar integration',
        'Basic analytics',
        'Email support',
      ],
      cta: 'Start Free Trial',
      popular: false,
    },
    {
      name: 'Growth',
      price: '$49',
      period: '/month',
      annual: '$499/year',
      description: 'For growing organizations with multiple teams',
      features: [
        'Up to 5 team pages',
        'Custom branding',
        'Application management',
        'Advanced calendar',
        'Team analytics',
        'Priority support',
        'Custom forms',
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Elite',
      price: '$99',
      period: '/month',
      annual: '$999/year',
      description: 'For elite academies and competitive programs',
      features: [
        'Unlimited teams',
        'Full website CMS',
        'Priority placement in search',
        'Recruiter dashboard',
        'Advanced analytics',
        'API access',
        'White-label options',
        'Dedicated support',
      ],
      cta: 'Start Free Trial',
      popular: false,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      annual: 'Contact us',
      description: 'Tailored solutions for large organizations',
      features: [
        'Everything in Elite',
        'White-label platform',
        'Onboarding assistance',
        'Custom integrations',
        'Advanced talent CRM',
        'SLA guarantees',
        'Dedicated account manager',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  const playerPlans = [
    {
      name: 'Free',
      price: '$0',
      period: '/forever',
      description: 'Start your athletic journey',
      features: [
        'Create player profile',
        'Search teams & tryouts',
        'Save favorite teams',
        'Apply to tryouts',
        'Basic stats tracking',
      ],
      cta: 'Get Started Free',
      popular: false,
    },
    {
      name: 'Pro Scout',
      price: '$5',
      period: '/month',
      annual: '$50/year',
      description: 'Stand out to recruiters',
      features: [
        'Everything in Free',
        'Enhanced visibility',
        'Featured applications',
        'Video highlight reels',
        'Advanced stats',
        'Priority support',
      ],
      cta: 'Upgrade to Pro',
      popular: false,
    },
    {
      name: 'All-Star',
      price: '$10',
      period: '/month',
      annual: '$100/year',
      description: 'Maximum exposure and opportunities',
      features: [
        'Everything in Pro Scout',
        'AI-powered matching',
        'Early tryout access',
        'Application insights',
        'Achievement badges',
        'Recruitment analytics',
        'College prep resources',
      ],
      cta: 'Go All-Star',
      popular: true,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Choose the perfect plan for your needs. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-2">For Organizations</h2>
            <p className="text-slate-400">
              Manage teams, discover talent, and streamline operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {organizationPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-slate-900/50 rounded-2xl border ${
                  plan.popular
                    ? 'border-blue-500/50 ring-2 ring-blue-500/20'
                    : 'border-slate-800/50'
                } p-8 hover:border-blue-500/50 transition-all`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="flex items-center space-x-1 bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-1 rounded-full text-white text-sm font-semibold">
                      <Star className="w-4 h-4 fill-white" />
                      <span>Most Popular</span>
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-slate-400 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-slate-400 ml-1">{plan.period}</span>
                  </div>
                  {plan.annual && (
                    <p className="text-sm text-slate-500 mt-2">{plan.annual}</p>
                  )}
                </div>

                <Link
                  to="/signup"
                  className={`block w-full py-3 px-4 rounded-lg font-semibold text-center mb-6 transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:shadow-lg hover:shadow-blue-500/50'
                      : 'bg-slate-800/50 text-white hover:bg-slate-800 border border-slate-700'
                  }`}
                >
                  {plan.cta}
                </Link>

                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-2">For Players</h2>
            <p className="text-slate-400">
              Connect with teams and showcase your talent
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {playerPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-slate-900/50 rounded-2xl border ${
                  plan.popular
                    ? 'border-cyan-400/50 ring-2 ring-cyan-400/20'
                    : 'border-slate-800/50'
                } p-8 hover:border-cyan-400/50 transition-all`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="flex items-center space-x-1 bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-1 rounded-full text-white text-sm font-semibold">
                      <Zap className="w-4 h-4 fill-white" />
                      <span>Best Value</span>
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-slate-400 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-slate-400 ml-1">{plan.period}</span>
                  </div>
                  {plan.annual && (
                    <p className="text-sm text-slate-500 mt-2">{plan.annual}</p>
                  )}
                </div>

                <Link
                  to="/signup"
                  className={`block w-full py-3 px-4 rounded-lg font-semibold text-center mb-6 transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-400/50'
                      : 'bg-slate-800/50 text-white hover:bg-slate-800 border border-slate-700'
                  }`}
                >
                  {plan.cta}
                </Link>

                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 bg-gradient-to-br from-blue-500/10 to-cyan-400/10 rounded-2xl border border-blue-500/20 p-12 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Questions about pricing?
          </h3>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Our team is here to help you find the perfect plan for your organization or athletic career.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all"
            >
              Start Free Trial
            </Link>
            <a
              href="mailto:sales@rosterup.com"
              className="px-8 py-3 bg-slate-800/50 border border-slate-700 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
