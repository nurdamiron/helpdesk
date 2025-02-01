import { Helmet } from 'react-helmet-async';

import { HomeView } from 'src/sections/home/view';

// ----------------------------------------------------------------------

const metadata = {
  title: 'Helpdesk: Современная платформа поддержки',
  description:
    'Эффективный инструмент для анализа и оптимизации бизнес-процессов, построенный на передовых технологиях визуализации данных и искусственного интеллекта',
};

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </Helmet>

      <HomeView />
    </>
  );
}
