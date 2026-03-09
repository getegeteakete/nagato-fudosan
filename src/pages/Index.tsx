import Hero from "@/components/Hero";
import QuickSearch from "@/components/QuickSearch";
import FeaturedProperties from "@/components/FeaturedProperties";
import CTASections from "@/components/CTASections";
import CompanyHighlights from "@/components/CompanyHighlights";
import TopNewsSection from "@/components/TopNewsSection";
import TopArticleSection from "@/components/TopArticleSection";

const Index = () => {
  return (
    <>
      <Hero />
      <QuickSearch />
      <TopNewsSection />
      <FeaturedProperties />
      <TopArticleSection />
      <CTASections />
      <CompanyHighlights />
    </>
  );
};

export default Index;
