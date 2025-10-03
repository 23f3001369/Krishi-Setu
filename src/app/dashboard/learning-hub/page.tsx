

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
import { transcribeAudio } from '@/ai/flows/speech-to-text';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

const qnaData = [
  {
    question: "What's the best way to improve soil fertility organically?",
    answer:
      'Improving soil fertility organically can be achieved through several methods. Regular application of compost adds rich organic matter. Cover cropping with legumes like clover or vetch fixes nitrogen in the soil. Crop rotation also prevents nutrient depletion by varying plant demands.',
  },
  {
    question: 'How can I effectively manage pests without using chemical pesticides?',
    answer:
      'Integrated Pest Management (IPM) is a great approach. Encourage natural predators like ladybugs and lacewings. Use physical barriers like row covers. Companion planting, such as marigolds with tomatoes, can deter pests. If needed, use organic-approved options like neem oil or insecticidal soap.',
  },
  {
    question: 'What are the key signs of water stress in crops?',
    answer:
      'Key signs of water stress include wilting or drooping leaves, especially during the hottest part of the day. The leaves might also appear to have a bluish-green tint or curl. Stunted growth and premature yellowing of lower leaves are also common indicators.',
  },
  {
    question: 'What is crop rotation and why is it important?',
    answer:
      'Crop rotation is the practice of planting different types of crops in the same area in sequenced seasons. It is important because it helps to reduce soil erosion, improves soil fertility and crop yield, and reduces the buildup of pests and weeds.'
  },
  {
      question: 'How do I test my soil\'s pH level?',
      answer:
      'You can use a simple soil testing kit available at most garden stores. You take a soil sample, mix it with the provided solution, and compare the color to a chart. For more accurate results, you can send a soil sample to a professional agricultural lab.'
  },
];

const articles = [
  {
    id: '1',
    title: 'Integrated Pest Management (IPM) Principles',
    description:
      'An overview of Integrated Pest Management from the official EPA website, a trusted source for environmental and agricultural safety.',
    imageId: 'learning-hub-article-3',
    link: 'https://www.epa.gov/safepestcontrol/integrated-pest-management-ipm-principles',
  },
  {
    id: '2',
    title: 'Soil Health',
    description:
      'A comprehensive guide on soil health from the USDA\'s Natural Resources Conservation Service, covering key aspects of soil quality.',
    imageId: 'learning-hub-article-1',
    link: 'https://www.nrcs.usda.gov/wps/portal/nrcs/main/soils/health/',
  },
  {
    id: '3',
    title: 'Drip Irrigation for Home Gardens',
    description:
      'A detailed guide from the University of California on how to implement efficient drip irrigation systems for gardens and small farms.',
    imageId: 'learning-hub-article-2',
    link: 'https://ucanr.edu/sites/scmg/files/27702.pdf',
  },
];

const videos = [
  {
    id: '1',
    title: 'How To Make Compost At Home',
    description:
      'A practical, step-by-step guide on creating your own compost pile to enrich your soil, from the popular YouTube channel "Garden Answer".',
    imageId: 'learning-hub-video-1',
    link: 'https://www.youtube.com/watch?v=s8yGgS-14Sg'
  },
  {
    id: '2',
    title: 'Top 6 Worst Garden Pests And How To Deal With Them',
    description:
      'Learn to identify and manage common garden pests organically with this informative video from "The Gardening Channel With James Prigioni".',
    imageId: 'learning-hub-article-3',
    link: 'https://www.youtube.com/watch?v=F3-s3z7hT54'
  },
  {
    id: '3',
    title: 'How to Build a Raised Bed Garden',
    description:
        'A complete guide to building, filling, and planting in a raised garden bed, from "Epic Gardening".',
    imageId: 'learning-hub-video-2',
    link: 'https://www.youtube.com/watch?v=fQe1-yYxG5g'
  },
  {
    id: '4',
    title: 'Drip Irrigation System: Complete Guide',
    description:
      'A comprehensive walkthrough on setting up a drip irrigation system, perfect for conserving water on any scale, from "Epic Gardening".',
    imageId: 'learning-hub-article-2',
    link: 'https://www.youtube.com/watch?v=L-Qz1qG5g-k'
  },
  {
    id: '5',
    title: 'The #1 Easiest Way To Test Your Soil',
    description:
        'A simple and effective soil testing method you can do at home to understand your soil\'s composition, from "The Millennial Gardener".',
    imageId: 'learning-hub-article-1',
    link: 'https://www.youtube.com/watch?v=p-I8n2-H-Lw'
  },
  {
    id: '6',
    title: 'Organic Farming for Beginners',
    description:
        'An introductory guide to the principles and practices of organic farming, covering everything from soil health to certification.',
    imageId: 'hero-image',
    link: 'https://www.youtube.com/watch?v=JPA01hM72i8'
  },
];

function AskAgriVaani() {
  const [query, setQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<LearningHubRecommendationOutput | null>(null);
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [micDisabled, setMicDisabled] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && !navigator.mediaDevices?.getUserMedia) {
        setError("Sorry, your browser doesn't support microphone access.");
        setMicDisabled(true);
    }
  }, []);

  const handleMicClick = async () => {
    setError(null);
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];

        recorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            setIsLoading(true);
            setQuery('Transcribing audio...');
            try {
              const result = await transcribeAudio({ audio: base64Audio });
              setQuery(result.text);
            } catch (e) {
              console.error(e);
              setError('Could not transcribe audio. Please try again.');
              setQuery('');
            } finally {
              setIsLoading(false);
            }
          };
          // Stop all tracks on the stream to release the microphone
          stream.getTracks().forEach(track => track.stop());
        };

        recorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Speech recognition error:", err);
        let errorMessage: React.ReactNode = 'Could not access the microphone. Please check permissions and try again.';
        if (err instanceof DOMException) {
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                errorMessage = "Microphone permission was denied. Please allow it in your browser settings.";
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                errorMessage = "No microphone was found. Please ensure one is connected and enabled.";
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                 errorMessage = (
                    <div>
                        <p>The microphone is currently in use or could not be accessed.</p>
                        <ul className="list-disc pl-5 mt-2 text-xs">
                            <li>Ensure no other browser tab or application is using your microphone.</li>
                            <li>Check your browser's site permissions to make sure microphone access is allowed.</li>
                            <li>Check your operating system's privacy settings to ensure your browser has permission to use the microphone.</li>
                            <li>Try restarting your browser or computer.</li>
                        </ul>
                    </div>
                );
            }
        }
         setError(errorMessage);
         setMicDisabled(true);
      }
    }
  };

  const handleSearch = async () => {
    if (!query || query === 'Transcribing audio...') return;

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
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleMicClick} 
              disabled={micDisabled || isLoading}
              title={micDisabled ? "Microphone is unavailable" : (isRecording ? "Stop recording" : "Use microphone")}
            >
              <Mic className={isRecording ? 'text-primary animate-pulse' : ''} />
            </Button>
            <Button onClick={handleSearch} disabled={isLoading || !query}>
              <Send className="mr-2 h-4 w-4" />
              {isLoading ? 'Searching...' : 'Ask'}
            </Button>
          </div>
        </CardContent>
        {isLoading && !recommendations && (
            <CardFooter className="p-6">
                 <p className="text-sm text-muted-foreground flex items-center">
                    <Bot className="mr-2 h-4 w-4 animate-pulse" />
                    {query === 'Transcribing audio...' ? 'Transcribing...' : 'AgriVaani is thinking...'}
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
                                             <Link href={article!.link} target="_blank">
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
                                                    <Link href={video!.link} target="_blank">
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
                    <Link href={article.link} target="_blank">
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
                        <Link href={video.link} target="_blank">
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
