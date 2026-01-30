"use client";

import { useState, useEffect } from 'react';
import { BrainCircuit, Brain, Heart, Turtle, Award, RotateCw, Check, Share2 } from 'lucide-react';
import quizData from '@/data/questoes_shift.json';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const BrainIcon = ({ type, className }: { type: string; className?: string }) => {
  switch (type) {
    case 'A': return <Turtle className={className} />;
    case 'B': return <Heart className={className} />;
    case 'C': return <Brain className={className} />;
    default: return <BrainCircuit className={className} />;
  }
};

export default function Quiz() {
  const allQuestions = quizData.niveis.flatMap(level => level.questoes);

  const [isLoaded, setIsLoaded] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [xp, setXp] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    const savedIndex = localStorage.getItem('reset-quiz-index');
    const savedXp = localStorage.getItem('reset-quiz-xp');
    if (savedIndex) setCurrentQuestionIndex(Math.min(parseInt(savedIndex), allQuestions.length));
    if (savedXp) setXp(parseInt(savedXp));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('reset-quiz-index', currentQuestionIndex.toString());
      localStorage.setItem('reset-quiz-xp', xp.toString());
    }
  }, [currentQuestionIndex, xp, isLoaded]);

  const tocarSom = (tipo: 'A' | 'B' | 'C' | 'nivel') => {
    const sons: Record<string, string> = {
      'A': 'sounds/click.mp3',
      'B': 'sounds/click.mp3',
      'C': 'sounds/brain-power.mp3',
      'nivel': 'sounds/level-up.mp3'
    };
    const audio = new Audio(sons[tipo]);
    audio.play().catch(e => console.log("Aguardando interação para tocar som"));
  };

  const handleAnswerSelect = (key: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(key);
    const points = key === 'C' ? 10 : key === 'B' ? 5 : 0;
    setXp(prev => prev + points);
    tocarSom(key as 'A' | 'B' | 'C');
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
      setSelectedAnswer(null);
      setCurrentQuestionIndex(prev => prev + 1);
      if ((currentQuestionIndex + 1) % 20 === 0) {
        tocarSom('nivel');
      }
    }, 2000);
  };

  const handleRestart = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleShare = async () => {
    const shareData = {
      title: 'RESET',
      text: 'O bullying não te define. O RESET sim. ⚡',
      url: window.location.href
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copiado! Agora é só colar para o seu amigo.');
      }
    } catch (err) {
      console.log('Erro ao compartilhar');
    }
  };

  if (!isLoaded) return <div className="font-headline text-2xl animate-pulse">CARREGANDO MISSÃO...</div>;

  const isQuizFinished = currentQuestionIndex >= allQuestions.length;
  const progress = (currentQuestionIndex / allQuestions.length) * 100;
  const currentQuestion = allQuestions[currentQuestionIndex];

  return (
    <div className="w-full max-w-2xl mx-auto p-4 font-body">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-headline text-primary flex items-center gap-3">
          <RotateCw className="w-8 h-8 text-primary drop-shadow-[0_0_5px_hsl(var(--primary))]"/>
          <span>RESET</span>
        </h1>
        <div className="flex items-center gap-2 font-bold text-accent bg-accent/10 px-4 py-2 rounded-full border border-accent/20">
          <Award className="w-5 h-5"/>
          <span>{xp} XP</span>
        </div>
      </header>

      <Card className="bg-card/50 border-primary/20 backdrop-blur-lg overflow-hidden relative min-h-[550px] flex flex-col shadow-2xl shadow-primary/10">
        <Progress value={progress} className="h-2 bg-primary/10 [&>div]:bg-accent"/>
        
        {isQuizFinished ? (
          <div className="p-10 text-center flex flex-col items-center justify-center gap-6 flex-grow">
            <p className="text-lg italic text-muted-foreground max-w-md" style={{fontWeight: 500}}>Eu aposto que você sente que ninguém sabe como é FICAR SOFRENDO TANTO BULLYING e estar preso a uma única saída, não é verdade?</p>
            <div className="text-7xl font-bold text-white">{xp} XP</div>
            
            <Card className="bg-background/20 border-primary/20 p-4 rounded-lg max-w-md">
                <p className="text-sm text-foreground/80 mb-2" style={{fontWeight: 500}}>O bullying não define você. A verdadeira força está na empatia e na coragem de ouvir.</p>
                <p className="text-sm font-semibold text-white" style={{fontWeight: 500}} >Se estiver pesado demais, procure um professor ou um adulto de confiança. Você não está sozinho.</p>
            </Card>

            <Button onClick={handleShare} variant="default" size="lg" className="font-bold tracking-wide bg-accent/90 hover:bg-accent text-white shadow-lg shadow-accent/20">
              Curtiu o RESET? Compartilhe com quem também precisa despertar o Neocórtex. ⚡
            </Button>
            <Button onClick={handleRestart} variant="outline" size="sm" className="font-bold uppercase tracking-widest text-muted-foreground hover:text-white mt-4">
              REINICIAR RUN
            </Button>
          </div>
        ) : (
          <div className="relative flex-grow flex flex-col p-6 sm:p-8">
            <CardHeader className="p-0 mb-8">
              <CardDescription className="text-muted-foreground font-mono uppercase tracking-widest">
                Missão {currentQuestion.id} / 100
              </CardDescription>
              <CardTitle className="text-2xl md:text-3xl font-medium text-foreground leading-tight mt-2">
                {currentQuestion.texto}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0 grid gap-4">
              {Object.entries(currentQuestion.alternativas).map(([key, value]) => (
                <Button
                  key={key}
                  variant="outline"
                  className={`h-auto min-h-min justify-start text-left py-3 px-4 bg-background/50 border text-foreground/80 hover:text-foreground transition-all duration-200 ease-in-out transform hover:scale-[1.02] group disabled:opacity-100 disabled:transform-none disabled:scale-100 disabled:cursor-default hover:bg-primary/10
                    ${key === 'C'
                      ? 'hover:border-accent hover:shadow-[0_0_12px_hsl(var(--accent))]'
                      : 'hover:border-primary hover:shadow-[0_0_8px_hsl(var(--primary))]'
                    }
                    ${selectedAnswer === key
                      ? (key === 'C' ? 'border-accent ring-2 ring-accent shadow-lg shadow-accent/20' : 'border-primary ring-2 ring-primary shadow-lg shadow-primary/20')
                      : 'border-primary/20'
                    }`}
                  onClick={() => handleAnswerSelect(key)}
                  disabled={!!selectedAnswer}
                >
                  <div className="flex items-start gap-4 w-full">
                    <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center font-bold font-mono text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-colors flex-shrink-0
                      ${selectedAnswer === key ? 'bg-primary text-primary-foreground' : ''}`}>
                      {key}
                    </div>
                    <span className="flex-1 text-base whitespace-normal">{value}</span>
                    {selectedAnswer === key && <Check className="w-6 h-6 text-accent self-center ml-auto"/>}
                  </div>
                </Button>
              ))}
            </CardContent>

            {showFeedback && (
              <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300 z-10">
                <BrainIcon type={selectedAnswer!} className="w-20 h-20 mb-4 text-primary animate-pulse"/>
                <h3 className="text-3xl font-headline text-white mb-2">
                  {selectedAnswer === 'C' ? 'NEOCÓRTEX ATIVADO!' : selectedAnswer === 'B' ? 'SISTEMA LÍMBICO' : 'CÉREBRO REPTILIANO'}
                </h3>
                <p className="text-muted-foreground">Processando evolução mental...</p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
