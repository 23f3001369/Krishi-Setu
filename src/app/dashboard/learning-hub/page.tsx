
'use client';

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
import {
  ArrowRight,
  PlayCircle,
  Mic,
  Send,
  Bot,
  Radio,
  Library,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import {
  learningHubRecommendation,
  type LearningHubRecommendationOutput,
} from '@/ai/flows/learning-hub-recommendation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

const qnaData = [
  {
    question: "What's the best way to improve soil fertility organically?",
    answer:
      'Improving soil fertility organically can be achieved through several methods. Regular application of compost adds rich organic matter. Cover cropping with legumes like clover or vetch fixes nitrogen in the soil. Crop rotation also prevents nutrient depletion by varying plant demands.',
  },
  {
    question:
      'How can I effectively manage pests without using using chemical pesticides?',
    answer:
      'Integrated Pest Management (IPM) is a great approach. Encourage natural predators like ladybugs and lacewings. Use physical barriers like row covers. Companion planting, such as marigolds with tomatoes, can deter pests. If needed, use organic-approved options like neem oil or insecticidal soap.',
  },
  {
    question: 'What are the key signs of water stress in crops?',
    answer:
      'Key signs of water stress include wilting or drooping leaves, especially during the hottest part of the day. The leaves might also appear to have a bluish-green tint or curl. Stunted growth and premature yellowing of lower leaves are also common indicators.',
  },
];

const articles = [
  {
    id: '1',
    title: 'The Ultimate Guide to Drip Irrigation Systems',
    description:
      'Learn how to set up, maintain, and optimize a drip irrigation system to conserve water and maximize crop yield.',
    imageId: 'learning-hub-article-2',
  },
  {
    id: '2',
    title: 'Understanding Soil pH and Its Importance',
    description:
      'A deep dive into what soil pH means, how to test it, and how to adjust it for optimal plant health.',
    imageId: 'learning-hub-article-1',
  },
  {
    id: '3',
    title: 'Natural Pest Control Methods for Your Farm',
    description:
      'Explore effective and eco-friendly ways to manage common farm pests without resorting to harsh chemicals.',
    imageId: 'learning-hub-article-3',
  },
];

const videos = [
  {
    id: '1',
    title: 'How to Properly Plant Seeds for Maximum Germination',
    description:
      'This step-by-step video guide shows you the best techniques for planting seeds to ensure a high germination rate.',
    imageId: 'learning-hub-video-1',
  },
  {
    id: '2',
    title: 'Techniques for a Successful and Efficient Harvest',
    description:
      'Watch expert farmers demonstrate their techniques for harvesting various crops quickly and without damage.',
    imageId: 'learning-hub-video-2',
  },
];

function AskAgriVaani() {
  const [query, setQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<LearningHubRecommendationOutput | null>(null);
  const [error, setError] = useState<React.ReactNode | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Initialize SpeechRecognition only on the client side
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!recognitionRef.current) {
        recognitionRef.current = new SpeechRecognition();
      }
      const recognition = recognitionRef.current;

      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        setQuery(transcript);
        setIsRecording(false);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'network') {
            setError('Network error for speech service. Please check your internet connection.');
        } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setError('Microphone permission was denied. Please allow it in your browser settings.');
        } else if (event.error === 'audio-capture') {
            setError(
              <div>
                <p className='font-bold mb-2'>Could not access the microphone.</p>
                <ul className='list-disc pl-5 text-xs space-y-1'>
                    <li>Ensure no other browser tab or application is using your microphone and try again.</li>
                    <li>Check your browser's site permissions to make sure microphone access is allowed for this page.</li>
                    <li>Check your operating system's privacy settings to ensure your browser has permission to use the microphone.</li>
                    <li>Try restarting your browser or computer.</li>
                </ul>
              </div>
            );
        } else {
            setError(`Speech recognition error: ${event.error}. Please try again or type your question.`);
        }
        setIsRecording(false);
      };
    } else if (typeof window !== 'undefined') {
        setError("Sorry, your browser doesn't support voice recognition.");
    }
  }, []);

  const handleVoiceSearch = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isRecording) {
      try {
        recognition.stop();
      } catch (e) {
        console.error("Error stopping recognition:", e);
      }
      setIsRecording(false);
    } else {
      setError(null);
      try {
        recognition.start();
        setIsRecording(true);
      } catch (e) {
        console.error("Error starting recognition:", e);
         if (e instanceof DOMException && e.name === 'NotAllowedError') {
             setError('Microphone permission was denied. Please allow it in your browser settings.');
        } else {
            setError("Could not start voice recognition. Please check permissions.");
        }
        setIsRecording(false);
      }
    }
  };


  const handleSearch = async () => {
    if (!query) return;

    setIsLoading(true);
    setRecommendations(null);
    setError(null);

    try {
      const result = await learningHubRecommendation({
        query,
        articles,
        videos,
      });
      setRecommendations(result);
    } catch (err) {
      setError('Sorry, I couldn\'t find any recommendations. Please try a different question.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const recommendedArticles = recommendations?.articles
    .map(rec => articles.find(a => a.id === rec.id))
    .filter(Boolean);
    
  const recommendedVideos = recommendations?.videos
    .map(rec => videos.find(v => v.id === rec.id))
    .filter(Boolean);

  return (
    <section>
      <h2 className="text-2xl font-bold font-headline mb-4">Ask AgriVaani</h2>
      <Card>
        <CardHeader>
          <CardTitle>Get Instant Answers</CardTitle>
          <CardDescription>
            Ask a question about your crops, and our AI will suggest relevant learning materials for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex gap-2">
            <Input
              placeholder="e.g., How do I treat pests on my tomato plants?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
            />
            <Button variant="ghost" size="icon" onClick={handleVoiceSearch} disabled={isLoading || !recognitionRef.current}>
              <Mic className={isRecording ? 'text-primary animate-pulse' : ''} />
            </Button>
            <Button onClick={handleSearch} disabled={isLoading || !query}>
              <Send className="mr-2 h-4 w-4" />
              {isLoading ? 'Searching...' : 'Ask'}
            </Button>
          </div>
        </CardContent>
        {isLoading && (
            <CardFooter className="p-6">
                 <p className="text-sm text-muted-foreground flex items-center">
                    <Bot className="mr-2 h-4 w-4 animate-pulse" />
                    AgriVaani is thinking...
                </p>
            </CardFooter>
        )}
        {error && (
             <CardFooter className="p-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Microphone Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </CardFooter>
        )}
        {recommendations && (
           <CardFooter className="flex-col items-start gap-4 p-6">
               {recommendedArticles && recommendedArticles.length > 0 && (
                 <div className="w-full">
                    <h3 className="font-semibold mb-2 flex items-center gap-2"><Badge variant="secondary">Suggested Articles</Badge> - {recommendations.articles[0].reasoning}</h3>
                     <div className="grid gap-4 md:grid-cols-2">
                         {recommendedArticles.map((article) => {
                             const image = PlaceHolderImages.find(p => p.id === article!.imageId);
                             return (
                                 <Card key={article!.id} className="flex flex-col">
                                     <CardHeader className="p-0">
                                         {image && (
                                             <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
                                                 <Image src={image.imageUrl} alt={image.description} data-ai-hint={image.imageHint} fill className="object-cover" />
                                             </div>
                                         )}
                                     </CardHeader>
                                     <CardContent className="flex-grow pt-4 p-6">
                                         <CardTitle>{article!.title}</CardTitle>
                                     </CardContent>
                                     <CardFooter className="p-6">
                                         <Button variant="outline" size="sm" asChild>
                                             <Link href="#">
                                                 Read More <ArrowRight className="ml-2 h-4 w-4" />
                                             </Link>
                                         </Button>
                                     </CardFooter>
                                 </Card>
                             )
                         })}
                     </div>
                 </div>
               )}
                {recommendedVideos && recommendedVideos.length > 0 && (
                 <div className="w-full">
                    <h3 className="font-semibold mb-2 flex items-center gap-2"><Badge variant="secondary">Suggested Videos</Badge> - {recommendations.videos[0].reasoning}</h3>
                     <div className="grid gap-4 md:grid-cols-2">
                         {recommendedVideos.map((video) => {
                             const image = PlaceHolderImages.find(p => p.id === video!.imageId);
                             return (
                               <Card key={video!.id} className="overflow-hidden">
                                   <div className="flex flex-col sm:flex-row">
                                       <div className="sm:w-1/3 relative aspect-video sm:aspect-square">
                                       {image && (
                                           <Image src={image.imageUrl} alt={image.description} data-ai-hint={image.imageHint} fill className="object-cover" />
                                       )}
                                       <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                           <PlayCircle className="h-10 w-10 text-white/80" />
                                       </div>
                                       </div>
                                       <div className="sm:w-2/3 flex flex-col p-4">
                                            <CardTitle>{video!.title}</CardTitle>
                                            <CardDescription className="text-xs mt-1 flex-grow">{video!.description}</CardDescription>
                                            <div className="mt-2">
                                                 <Button size="sm" asChild>
                                                    <Link href="#">
                                                        Watch <PlayCircle className="ml-2 h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </div>
                                       </div>
                                   </div>
                               </Card>
                             )
                         })}
                     </div>
                 </div>
               )}

               {recommendedArticles?.length === 0 && recommendedVideos?.length === 0 && (
                    <Alert>
                        <Bot className="h-4 w-4" />
                        <AlertTitle>No specific recommendations found</AlertTitle>
                        <AlertDescription>
                            I couldn't find specific content for your query, but feel free to browse the articles and videos below.
                        </AlertDescription>
                    </Alert>
               )}
           </CardFooter>
        )}
      </Card>
    </section>
  );
}


export default function LearningHubPage() {
  return (
    <div className="space-y-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline">
          AgriVaani
        </h1>
        <p className="text-xl text-primary font-semibold mt-1">
         “आवाज़ कृषि की , तरक्की किसान की ”
        </p>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          A multilingual audio-video platform covering 50+ crops and modern techniques, designed to support farmers' continuous learning.
        </p>
      </div>
      
      <AskAgriVaani />
      
      <section>
        <h2 className="text-2xl font-bold font-headline mb-4">Upcoming Features</h2>
         <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-muted/40">
              <CardHeader className="flex flex-row items-center gap-4">
                  <Radio className="w-8 h-8 text-primary" />
                  <div>
                    <CardTitle>Agri Radio</CardTitle>
                    <CardDescription>A radio stream with expert interviews, weather alerts, and farming practices, accessible offline.</CardDescription>
                  </div>
              </CardHeader>
            </Card>
             <Card className="bg-muted/40">
              <CardHeader className="flex flex-row items-center gap-4">
                   <Library className="w-8 h-8 text-primary" />
                  <div>
                    <CardTitle>E-Crop Library</CardTitle>
                    <CardDescription>A digital collection of crop guides and resources in regional languages for easy reading and sharing.</CardDescription>
                  </div>
              </CardHeader>
            </Card>
         </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold font-headline mb-4">
          Frequently Asked Questions
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {qnaData.map((item, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section>
        <h2 className="text-2xl font-bold font-headline mb-4">
          Featured Articles
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => {
            const image = PlaceHolderImages.find(
              (p) => p.id === article.imageId
            );
            return (
              <Card key={article.id} className="flex flex-col">
                <CardHeader>
                  {image && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
                      <Image
                        src={image.imageUrl}
                        alt={image.description}
                        data-ai-hint={image.imageHint}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </CardHeader>
                <CardContent className="flex-grow p-6">
                  <CardTitle>{article.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {article.description}
                  </CardDescription>
                </CardContent>
                <CardFooter className="p-6">
                  <Button variant="outline" asChild>
                    <Link href="#">
                      Read More <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold font-headline mb-4">
          Video Tutorials
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {videos.map((video) => {
            const image = PlaceHolderImages.find(
              (p) => p.id === video.imageId
            );
            return (
              <Card key={video.id} className="overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-1/3 relative aspect-video sm:aspect-square">
                    {image && (
                      <Image
                        src={image.imageUrl}
                        alt={image.description}
                        data-ai-hint={image.imageHint}
                        fill
                        className="object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <PlayCircle className="h-12 w-12 text-white/80" />
                    </div>
                  </div>
                  <div className="sm:w-2/3 flex flex-col">
                    <CardHeader>
                      <CardTitle>{video.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow p-6">
                      <CardDescription>{video.description}</CardDescription>
                    </CardContent>
                    <CardFooter className="p-6">
                      <Button asChild>
                        <Link href="#">
                          Watch Video <PlayCircle className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}
