import { motion } from 'framer-motion';

export default function TermsOfService() {
    return (
        <div className="bg-white min-h-screen font-['-apple-system','BlinkMacSystemFont','SF_Pro_Display','Segoe_UI','Roboto','sans-serif']">
            <section className="py-20 px-6 md:px-8 lg:px-12 max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-[rgb(29,29,31)] mb-8">Terms of Service</h1>
                    <p className="text-[rgb(134,142,150)] mb-12">Last updated: November 24, 2023</p>

                    <div className="prose prose-lg prose-slate max-w-none text-[rgb(29,29,31)]">
                        <p>
                            Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the RosterUp website and mobile application (the "Service") operated by RosterUp ("us", "we", or "our").
                        </p>

                        <h3 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h3>
                        <p>
                            By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.
                        </p>

                        <h3 className="text-2xl font-semibold mt-8 mb-4">2. Accounts</h3>
                        <p>
                            When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
                        </p>
                        <p>
                            You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service.
                        </p>

                        <h3 className="text-2xl font-semibold mt-8 mb-4">3. Content</h3>
                        <p>
                            Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.
                        </p>

                        <h3 className="text-2xl font-semibold mt-8 mb-4">4. Intellectual Property</h3>
                        <p>
                            The Service and its original content (excluding Content provided by users), features and functionality are and will remain the exclusive property of RosterUp and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
                        </p>

                        <h3 className="text-2xl font-semibold mt-8 mb-4">5. Termination</h3>
                        <p>
                            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
                        </p>

                        <h3 className="text-2xl font-semibold mt-8 mb-4">6. Limitation of Liability</h3>
                        <p>
                            In no event shall RosterUp, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                        </p>

                        <h3 className="text-2xl font-semibold mt-8 mb-4">7. Changes</h3>
                        <p>
                            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                        </p>

                        <h3 className="text-2xl font-semibold mt-8 mb-4">8. Contact Us</h3>
                        <p>
                            If you have any questions about these Terms, please contact us at:
                            <br />
                            <a href="mailto:support@rosterup.com" className="text-[rgb(0,113,227)] hover:underline">support@rosterup.com</a>
                        </p>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}
