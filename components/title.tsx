interface TitleProps {
  title: string;
  description: string;
}

const Title = ({ title, description }: TitleProps) => {
  return (
    <section className="bg-white border rounded-sm p-4 flex flex-col justify-between gap-2">
      <h1 className="text-xl font-bold">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </section>
  );
};

export { Title };
