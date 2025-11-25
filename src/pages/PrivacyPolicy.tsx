import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
    return (
        <div className="bg-white min-h-screen font-['-apple-system','BlinkMacSystemFont','SF_Pro_Display','Segoe_UI','Roboto','sans-serif']">
            <section className="py-20 px-6 md:px-8 lg:px-12 max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-[rgb(29,29,31)] mb-8">Privacy Policy</h1>
                    <p className="text-[rgb(134,142,150)] mb-12">Last updated: November 24, 2023</p>

                    <div className="prose prose-lg prose-slate max-w-none text-[rgb(29,29,31)]">
                        <p>
                            At RosterUp, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our mobile application.
                        </p>

                        <h3 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h3>
                        <p>
                            We collect information that you provide directly to us when you register for an account, create a profile, or communicate with us. This includes:
                        </p>
                        <ul className="list-disc pl-6 mb-4 space-y-2">
                            <li>Personal identification information (Name, email address, phone number, etc.)</li>
                            <li>Profile information (Sports interests, team affiliations, role)</li>
                            <li>Content you upload (Photos, videos, team rosters)</li>
                        </ul>

                        <h3 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Information</h3>
                        <p>
                            We use the information we collect to:
                        </p>
                        <ul className="list-disc pl-6 mb-4 space-y-2">
                            <li>Provide, maintain, and improve our services</li>
                            <li>Process transactions and send related information</li>
                            <li>Send you technical notices, updates, security alerts, and support messages</li>
                            <li>Respond to your comments, questions, and requests</li>
                        </ul>

                        <h3 className="text-2xl font-semibold mt-8 mb-4">3. Sharing of Information</h3>
                        <p>
                            We do not sell your personal information. We may share information as follows:
                        </p>
                        <ul className="list-disc pl-6 mb-4 space-y-2">
                            <li>With vendors, consultants, and other service providers who need access to such information to carry out work on our behalf</li>
                            <li>In response to a request for information if we believe disclosure is in accordance with any applicable law, regulation, or legal process</li>
                        </ul>

                        <h3 className="text-2xl font-semibold mt-8 mb-4">4. Data Security</h3>
                        <p>
                            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                        </p>

                        <h3 className="text-2xl font-semibold mt-8 mb-4">5. Contact Us</h3>
                        <p>
                            If you have questions or comments about this Privacy Policy, please contact us at:
                            <br />
                            <a href="mailto:support@rosterup.com" className="text-[rgb(0,113,227)] hover:underline">support@rosterup.com</a>
                        </p>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}
