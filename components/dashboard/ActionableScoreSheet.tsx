import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { IntakeData } from '@/lib/profile'
import { BookOpen, GraduationCap, Briefcase, Calculator, ExternalLink } from 'lucide-react'

export type CategoryKey = 'language' | 'education' | 'work' | 'pathways' | null;

interface ActionableScoreSheetProps {
  category: CategoryKey;
  onClose: () => void;
  profile: IntakeData;
  setProfile: (p: IntakeData) => void;
  onSaveToProfile: () => void;
  onReset: () => void;
}

export function ActionableScoreSheet({ category, onClose, profile, setProfile, onSaveToProfile, onReset }: ActionableScoreSheetProps) {
  
  const handleUpdate = (field: keyof IntakeData, value: string) => {
    setProfile({ ...profile, [field]: value })
  }

  const renderContent = () => {
    switch (category) {
      case 'language':
        return (
          <div className="flex flex-col gap-6">
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <h3 className="flex items-center gap-2 font-bold text-blue-900 mb-2">
                <BookOpen className="h-5 w-5" /> Test a New Language Score
              </h3>
              <p className="text-sm text-blue-800 mb-4">
                Slide the inputs to see how improving your IELTS scores affects your CRS in real-time.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Reading (CLB)</Label>
                  <Input type="number" min="3" max="10" value={profile.langReading} onChange={e => handleUpdate('langReading', e.target.value)} />
                </div>
                <div>
                  <Label>Writing (CLB)</Label>
                  <Input type="number" min="3" max="10" value={profile.langWriting} onChange={e => handleUpdate('langWriting', e.target.value)} />
                </div>
                <div>
                  <Label>Listening (CLB)</Label>
                  <Input type="number" min="3" max="10" value={profile.langListening} onChange={e => handleUpdate('langListening', e.target.value)} />
                </div>
                <div>
                  <Label>Speaking (CLB)</Label>
                  <Input type="number" min="3" max="10" value={profile.langSpeaking} onChange={e => handleUpdate('langSpeaking', e.target.value)} />
                </div>
              </div>
            </div>
            
            <div className="rounded-xl border border-subtle bg-surface-card p-4 shadow-sm">
               <h4 className="font-bold text-heading mb-2">Next Steps</h4>
               <ul className="text-sm text-muted-text flex flex-col gap-2">
                 <li>• Register for the IELTS General Training exam.</li>
                 <li>• Consistent practice on Listening and Reading yields the fastest point gains.</li>
               </ul>
               <Button variant="outline" className="w-full mt-4 flex gap-2">
                 Book Official IELTS <ExternalLink className="h-4 w-4" />
               </Button>
            </div>
          </div>
        )
      case 'education':
        return (
          <div className="flex flex-col gap-6">
             <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <h3 className="flex items-center gap-2 font-bold text-blue-900 mb-2">
                <GraduationCap className="h-5 w-5" /> Upgrade Education
              </h3>
              <div className="flex flex-col gap-4 mt-4">
                <div>
                  <Label>Accredited Education Level</Label>
                  <Select value={profile.educationLevel} onValueChange={(v) => handleUpdate('educationLevel', v || '')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="secondary">High School</SelectItem>
                      <SelectItem value="1-year">1-Year Program</SelectItem>
                      <SelectItem value="2-year">2-Year Program</SelectItem>
                      <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                      <SelectItem value="two-credentials">Two or more certificates (one 3+ years)</SelectItem>
                      <SelectItem value="masters">Master's Degree</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>ECA Completed?</Label>
                  <Select value={profile.ecaCompleted} onValueChange={(v) => handleUpdate('ecaCompleted', v || '')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl border border-subtle bg-surface-card p-4 shadow-sm">
               <h4 className="font-bold text-heading mb-2">Educational Credential Assessment (ECA)</h4>
               <p className="text-sm text-muted-text mb-4">
                 If your degree was obtained outside of Canada, you must have it verified by an approved organization like WES. 
               </p>
               <Button variant="outline" className="w-full flex gap-2">
                 Start WES Assessment <ExternalLink className="h-4 w-4" />
               </Button>
            </div>
          </div>
        )
      case 'work':
        return (
           <div className="flex flex-col gap-6">
             <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <h3 className="flex items-center gap-2 font-bold text-blue-900 mb-2">
                <Briefcase className="h-5 w-5" /> Simulate Work Experience
              </h3>
              <div className="flex flex-col gap-4 mt-4">
                <div>
                  <Label>Canadian Work Experience (Months)</Label>
                  <p className="text-xs text-muted-text mb-2">Reaching 12, 24, or 36 months jumps your score.</p>
                  <Input type="number" value={profile.canadianWorkMonths} onChange={e => handleUpdate('canadianWorkMonths', e.target.value)} />
                </div>
                <div>
                  <Label>Foreign Work Experience (Years)</Label>
                  <Input type="number" value={profile.foreignWorkYears} onChange={e => handleUpdate('foreignWorkYears', e.target.value)} />
                </div>
                <div>
                  <Label>Valid Job Offer (LMIA)?</Label>
                  <Select value={profile.hasJobOffer} onValueChange={(v) => handleUpdate('hasJobOffer', v || '')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes (+50/200 points)</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Sheet open={!!category} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-surface-alt border-l border-subtle">
        <SheetHeader className="mb-6 border-b border-subtle pb-4">
          <SheetTitle className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="h-6 w-6 text-navly-red" /> What-If Sandbox
          </SheetTitle>
          <SheetDescription>
            Experiment with your metrics. Watch the gauge in the background update instantly.
          </SheetDescription>
        </SheetHeader>
        
        <div className="mb-8">
          {renderContent()}
        </div>

        <div className="flex flex-col gap-3 border-t border-subtle pt-6">
          <Button onClick={onSaveToProfile} className="w-full bg-navly-navy hover:bg-navly-navy/80 text-white py-6">
            I achieved this! Save to Profile
          </Button>
          <Button onClick={onReset} variant="outline" className="w-full border-subtle text-muted-text">
            Reset to current stats
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
