

"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Check, MapPin, Link as LinkIcon, ChevronsRight, ChevronsLeft, Send, X, Plus } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUser, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, addDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";


const totalSteps = 3;

export default function FarmRegistrationPage() {
  const searchParams = useSearchParams();
  const farmId = searchParams.get('id');

  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(!!farmId);
  const [formData, setFormData] = useState({
    farmName: "",
    farmSize: "",
    mainCrops: "",
    address: "",
  });
  const [photos, setPhotos] = useState<string[]>([]);
  
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const farmDocRef = useMemoFirebase(() => {
    if (!db || !farmId) return null;
    return doc(db, 'farms', farmId);
  }, [db, farmId]);

  useEffect(() => {
    if (farmDocRef) {
      setIsLoading(true);
      getDoc(farmDocRef).then(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            farmName: data.name || '',
            farmSize: data.size?.toString() || '',
            mainCrops: Array.isArray(data.mainCrops) ? data.mainCrops.join(', ') : '',
            address: data.location || '',
          });
          setPhotos(data.photos || []);
        } else {
          toast({ variant: 'destructive', title: 'Error', description: 'Farm not found.' });
        }
      }).catch(error => {
        console.error("Error fetching farm document:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch farm details.' });
      }).finally(() => {
        setIsLoading(false);
      });
    }
  }, [farmDocRef, toast]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const addPhotoUrl = (url: string) => {
    if (url && !photos.includes(url)) {
      setPhotos(prev => [...prev, url]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  }

  const isStep1Valid = formData.farmName.trim() !== "" && formData.farmSize.trim() !== "" && formData.mainCrops.trim() !== "";
  const isStep2Valid = formData.address.trim() !== "";

  const handleNext = () => {
    if (step === 1 && !isStep1Valid) return;
    if (step === 2 && !isStep2Valid) return;
    setStep((prev) => Math.min(prev + 1, totalSteps));
  };
  
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));
  
  const handleSubmit = async () => {
    if (!user || !db) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'You must be logged in to register a farm.',
        });
        return;
    }

    const farmData = {
        farmerId: user.uid,
        name: formData.farmName,
        size: Number(formData.farmSize),
        mainCrops: formData.mainCrops.split(',').map(s => s.trim()),
        location: formData.address,
        photos: photos,
    };

    try {
        if (farmDocRef) {
             await updateDoc(farmDocRef, farmData);
             toast({
                title: 'Farm Updated',
                description: 'Your farm details have been successfully updated.',
             });
        } else {
            const farmsCollectionRef = collection(db, 'farms');
            await addDoc(farmsCollectionRef, farmData);
            toast({
                title: 'Registration Complete!',
                description: 'Your farm has been successfully registered.',
            });
        }
        setIsSubmitted(true);
    } catch (error) {
        console.error("Error writing document: ", error);
        toast({
            variant: 'destructive',
            title: farmId ? 'Update Failed' : 'Registration Failed',
            description: `Could not save your farm details. Please try again.`,
        });
    }
  };

  const progress = (step / totalSteps) * 100;

  if (isSubmitted) {
    return (
        <div className="w-full max-w-2xl mx-auto">
            <Card className="w-full">
                <CardHeader className="items-center text-center p-6">
                    <div className="bg-primary/10 p-3 rounded-full mb-4">
                        <Check className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle>{farmId ? 'Update Successful!' : 'Registration Complete!'}</CardTitle>
                    <CardDescription>{farmId ? 'Your farm details have been updated.' : 'Your farm has been successfully registered.'}</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <Alert>
                        <Send className="h-4 w-4" />
                        <AlertTitle>What's Next?</AlertTitle>
                        <AlertDescription>
                            You can view your updated farm details on your profile or explore the dashboard.
                        </AlertDescription>
                    </Alert>
                </CardContent>
                <CardFooter className="p-6">
                    <Button className="w-full" onClick={() => window.location.href = '/dashboard/profile'}>Go to My Profile</Button>
                </CardFooter>
            </Card>
        </div>
    )
  }

  return (
    <div className="space-y-8 w-full p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight font-headline">{farmId ? 'Edit Your Farm' : 'Register Your Farm'}</h1>
            <p className="text-muted-foreground">Follow the steps to {farmId ? 'update' : 'add'} your farm details.</p>
        </div>
        <Card className="w-full">
        <CardHeader className="p-6">
            <CardTitle>Step {step}: {step === 1 ? 'Farm Details' : step === 2 ? 'Location' : 'Photos'}</CardTitle>
            <CardDescription>
                {step === 1 ? 'Provide basic information about your farm.' : step === 2 ? 'Pin your farm\'s location.' : 'Add links to photos of your farm.'}
            </CardDescription>
            <Progress value={progress} className="w-full mt-2" />
        </CardHeader>
        <CardContent className="p-6">
            {isLoading ? (
                <div className="space-y-4 max-w-2xl mx-auto">
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-8 w-1/4 mt-4" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-8 w-1/4 mt-4" />
                    <Skeleton className="h-20 w-full" />
                </div>
            ) : (
                <>
                    {step === 1 && <Step1 formData={formData} handleChange={handleChange} />}
                    {step === 2 && <Step2 formData={formData} handleChange={handleChange} />}
                    {step === 3 && (
                      <Step3 
                        photos={photos} 
                        addPhotoUrl={addPhotoUrl} 
                        removePhoto={removePhoto} 
                      />
                    )}
                </>
            )}
        </CardContent>
        <CardFooter className="flex justify-between p-6">
            <Button variant="outline" onClick={handleBack} disabled={step === 1}>
                <ChevronsLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
            {step < totalSteps ? (
            <Button onClick={handleNext} disabled={(step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid)}>
                Next
                <ChevronsRight className="ml-2 h-4 w-4" />
            </Button>
            ) : (
            <Button onClick={handleSubmit}>
                {farmId ? 'Update Farm' : 'Submit'}
                <Send className="ml-2 h-4 w-4" />
            </Button>
            )}
        </CardFooter>
        </Card>
    </div>
  );
}

type Step1Props = {
    formData: {
        farmName: string;
        farmSize: string;
        mainCrops: string;
    };
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

function Step1({ formData, handleChange }: Step1Props) {
  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="space-y-2">
        <Label htmlFor="farmName">Farm Name</Label>
        <Input id="farmName" placeholder="e.g., Sunny Meadows Farm" required value={formData.farmName} onChange={handleChange} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="farmSize">Farm Size (in acres)</Label>
        <Input id="farmSize" type="number" placeholder="e.g., 50" required value={formData.farmSize} onChange={handleChange} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mainCrops">Main Crops</Label>
        <Textarea id="mainCrops" placeholder="e.g., Corn, Soybeans, Wheat" required value={formData.mainCrops} onChange={handleChange} />
      </div>
    </div>
  );
}

type Step2Props = {
    formData: {
        address: string;
    };
    handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

function Step2({ formData, handleChange }: Step2Props) {
  return (
    <div className="space-y-4">
        <div className="space-y-2 max-w-2xl mx-auto">
            <Label htmlFor="address">Address or general location</Label>
            <Textarea id="address" placeholder="e.g., Near Springfield, Main road" required value={formData.address} onChange={handleChange} />
        </div>
        <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center mt-4">
            <div className="text-center text-muted-foreground p-4">
                <MapPin className="mx-auto h-8 w-8 mb-2" />
                <p>Map view will be available here.</p>
                <p className="text-xs">(Future feature)</p>
            </div>
        </div>
    </div>
  );
}


type Step3Props = {
  photos: string[];
  addPhotoUrl: (url: string) => void;
  removePhoto: (index: number) => void;
};

function Step3({ photos, addPhotoUrl, removePhoto }: Step3Props) {
    const [currentUrl, setCurrentUrl] = useState('');

    const handleAddClick = () => {
        addPhotoUrl(currentUrl);
        setCurrentUrl('');
    }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
        <div className="space-y-2">
            <Label htmlFor="photoUrl">Add Photo URL</Label>
            <div className="flex gap-2">
                 <Input 
                  id="photoUrl"
                  placeholder="https://example.com/image.jpg"
                  value={currentUrl}
                  onChange={(e) => setCurrentUrl(e.target.value)}
                />
                <Button type="button" onClick={handleAddClick} disabled={!currentUrl}>
                    <Plus className="mr-2 h-4 w-4" /> Add
                </Button>
            </div>
        </div>
        
        {photos.length > 0 &&
            <div className="space-y-2">
                <Label>Photo Previews</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {photos.map((photo, index) => (
                        <div key={index} className="relative aspect-square w-full overflow-hidden rounded-md border">
                            <Image src={photo} alt={`Farm photo ${index + 1}`} fill className="object-cover" unoptimized/>
                            <Button 
                              variant="destructive" 
                              size="icon" 
                              className="absolute top-1 right-1 h-6 w-6 rounded-full"
                              onClick={() => removePhoto(index)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        }
    </div>
  );
}

    