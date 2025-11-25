import { motion } from 'framer-motion';

export default function CookiePolicy() {
    return (
        <div className="bg-white min-h-screen font-['-apple-system','BlinkMacSystemFont','SF_Pro_Display','Segoe_UI','Roboto','sans-serif']">
            <section className="py-20 px-6 md:px-8 lg:px-12 max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-[rgb(29,29,31)] mb-8">Cookie Policy</h1>
                    <p className="text-[rgb(134,142,150)] mb-12">Last updated: November 24, 2023</p>

                    <div className="prose prose-lg prose-slate max-w-none text-[rgb(29,29,31)]">
                        <p>
                            This Cookie Policy explains what cookies are and how we use them. You should read this policy so you can understand what type of cookies we use, or the information we collect using cookies and how that information is used.
                        </p>

                        <h3 className="text-2xl font-semibold mt-8 mb-4">1. What Are Cookies?</h3>
                        <p>
                            Cookies are small pieces of text sent by your web browser by a website you visit. A cookie file is stored in your web browser and allows the Service or a third-party to recognize you and make your next visit easier and the Service more useful to you.
                        </p>

                        <h3 className="text-2xl font-semibold mt-8 mb-4">2. How RosterUp Uses Cookies</h3>
                        <p>
                            When you use and access the Service, we may place a number of cookies files in your web browser. We use cookies for the following purposes:
                        </p>
                        <ul className="list-disc pl-6 mb-4 space-y-2">
                            <li>To enable certain functions of the Service</li>
                            <li>To provide analytics</li>
                            <li>To store your preferences</li>
                            <li>To enable advertisements delivery, including behavioral advertising</li>
                        </ul>

                        <h3 className="text-2xl font-semibold mt-8 mb-4">3. Types of Cookies We Use</h3>
                        <p>
                            We use both session and persistent cookies on the Service and we use different types of cookies to run the Service:
                        </p>
                        <ul className="list-disc pl-6 mb-4 space-y-2">
                            <li><strong>Essential cookies:</strong> We may use essential cookies to authenticate users and prevent fraudulent use of user accounts.</li>
                            <li><strong>Analytics cookies:</strong> We may use analytics cookies to track information how the Service is used so that we can make improvements.</li>
                        </ul>

                        <h3 className="text-2xl font-semibold mt-8 mb-4">4. Your Choices Regarding Cookies</h3>
                        <p>
                            If you'd like to delete cookies or instruct your web browser to delete or refuse cookies, please visit the help pages of your web browser. Please note, however, that if you delete cookies or refuse to accept them, you might not be able to use all of the features we offer, you may not be able to store your preferences, and some of our pages might not display properly.
                        </p>

                        <h3 className="text-2xl font-semibold mt-8 mb-4">5. Contact Us</h3>
                        <p>
                            If you have any questions about our Cookie Policy, please contact us at:
                            <br />
                            <a href="mailto:support@rosterup.com" className="text-[rgb(0,113,227)] hover:underline">support@rosterup.com</a>
                        </p>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}
