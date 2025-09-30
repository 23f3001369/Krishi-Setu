import Image from 'next/image';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, PlayCircle } from 'lucide-react';
import Link from 'next/link';

const qnaData = [
    {
      question: "What's the best way to improve soil fertility organically?",
      answer: "Improving soil fertility organically can be achieved through several methods. Regular application of compost adds rich organic matter. Cover cropping with legumes like clover or vetch fixes nitrogen in the soil. Crop rotation also prevents nutrient depletion by varying plant demands."
    },
    {
      question: "How can I effectively manage pests without using chemical pesticides?",
      answer: "Integrated Pest Management (IPM) is a great approach. Encourage natural predators like ladybugs and lacewings. Use physical barriers like row covers. Companion planting, such as marigolds with tomatoes, can deter pests. If needed, use organic-approved options like neem oil or insecticidal soap."
    },
    {
      question: "What are the key signs of water stress in crops?",
      answer: "Key signs of water stress include wilting or drooping leaves, especially during the hottest part of the day. The leaves might also appear to have a bluish-green tint or curl. Stunted growth and premature yellowing of lower leaves are also common indicators."
    },
];

const articles = [
    {
        id: "1",
        title: "The Ultimate Guide to Drip Irrigation Systems",
        description: "Learn how to set up, maintain, and optimize a drip irrigation system to conserve water and maximize crop yield.",
        imageId: "learning-hub-article-2"
    },
    {
        id: "2",
        title: "Understanding Soil pH and Its Importance",
        description: "A deep dive into what soil pH means, how to test it, and how to adjust it for optimal plant health.",
        imageId: "learning-hub-article-1"
    },
    {
        id: "3",
        title: "Natural Pest Control Methods for Your Farm",
        description: "Explore effective and eco-friendly ways to manage common farm pests without resorting to harsh chemicals.",
        imageId: "learning-hub-article-3"
    }
]

const videos = [
    {
        id: "1",
        title: "How to Properly Plant Seeds for Maximum Germination",
        description: "This step-by-step video guide shows you the best techniques for planting seeds to ensure a high germination rate.",
        imageId: "learning-hub-video-1"
    },
    {
        id: "2",
        title: "Techniques for a Successful and Efficient Harvest",
        description: "Watch expert farmers demonstrate their techniques for harvesting various crops quickly and without damage.",
        imageId: "learning-hub-video-2"
    }
]

export default function LearningHubPage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Learning Hub (AgriVaani)</h1>
        <p className="text-muted-foreground">Your knowledge base for smart farming. Find answers, articles, and videos.</p>
      </div>

      <section>
        <h2 className="text-2xl font-bold font-headline mb-4">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          {qnaData.map((item, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section>
        <h2 className="text-2xl font-bold font-headline mb-4">Featured Articles</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => {
            const image = PlaceHolderImages.find(p => p.id === article.imageId);
            return (
              <Card key={article.id} className="flex flex-col">
                <CardHeader>
                    {image && (
                        <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
                            <Image src={image.imageUrl} alt={image.description} data-ai-hint={image.imageHint} fill className="object-cover" />
                        </div>
                    )}
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardTitle className="text-lg">{article.title}</CardTitle>
                  <CardDescription className="mt-2">{article.description}</CardDescription>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" asChild>
                        <Link href="#">
                            Read More <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </section>
      
      <section>
        <h2 className="text-2xl font-bold font-headline mb-4">Video Tutorials</h2>
        <div className="grid gap-6 md:grid-cols-2">
            {videos.map((video) => {
                const image = PlaceHolderImages.find(p => p.id === video.imageId);
                return (
                <Card key={video.id} className="overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-1/3 relative aspect-video sm:aspect-square">
                        {image && (
                            <Image src={image.imageUrl} alt={image.description} data-ai-hint={image.imageHint} fill className="object-cover" />
                        )}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <PlayCircle className="h-12 w-12 text-white/80" />
                        </div>
                        </div>
                        <div className="sm:w-2/3 flex flex-col">
                            <CardHeader>
                                <CardTitle className="text-lg">{video.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <CardDescription>{video.description}</CardDescription>
                            </CardContent>
                            <CardFooter>
                                <Button asChild>
                                <Link href="#">
                                    Watch Video <PlayCircle className="ml-2 h-4 w-4" />
                                </Link>
                                </Button>
                            </CardFooter>
                        </div>
                    </div>
                </Card>
                )
            })}
        </div>
      </section>

    </div>
  );
}
