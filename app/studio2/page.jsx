import Section from './components/Section';

export default function page() {
  return (
    <div className="flex w-full justify-center">
      <div className="grid grid-cols-3 gap-4 p-4">
        <Section description="Total Revenue">
          <h1>$15,231.89</h1>
          <p>+20.1% from last month</p>
        </Section>
        <Section description="Subscriptions" action="View More">
          <p>+2,350</p>
          <p>+180.1% from last month</p>
        </Section>
        <Section title="Move Goal">
          <p>Set your daily activity goal.</p>
        </Section>
        <Section
          className="col-span-2"
          title="Create an account"
          description="Enter your email to create an account and access all features."
        >
          <p>This is the content of my section.</p>
        </Section>
        <Section title="My Section">
          <p>This is the content of my section.</p>
        </Section>
        <Section title="My Section">
          <p>This is the content of my section.</p>
        </Section>
        <Section title="My Section">
          <p>This is the content of my section.</p>
        </Section>
        <Section title="My Section">
          <p>This is the content of my section.</p>
        </Section>
        <Section title="My Section">
          <p>This is the content of my section.</p>
        </Section>
      </div>
    </div>
  );
}
