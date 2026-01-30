"use client";

import { useState, useEffect } from 'react';
import { BrainCircuit, Brain, Heart, Turtle, Award, RotateCw } from 'lucide-react';
// Importamos o seu JSON diretamente aqui
import quizData from '@/data/questoes_shift.json';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

// Componente de Ícone baseado no tipo de cérebro
const BrainIcon = ({ type, className }: { type: string; className?: string }) => {
  switch (type) {
    case 'A': return <Turtle className={className} />; // Reptiliano
    case 'B': return <Heart className={className} />;  // Límbico
    case 'C': return <Brain className={className} />;  // Neocórtex
    default: return <BrainCircuit className={className} />;
  }
};

export default function Quiz() {
  // Achata todos os níveis em uma única lista de 100 questões
  const allQuestions = quizData.niveis.flatMap(level => level.questoes);

  const [isLoaded, setIsLoaded] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [xp, setXp] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Carregar progresso do LocalStorage
  useEffect(() => {
    const savedIndex = localStorage.getItem('reset-quiz-index');
    const savedXp = localStorage.getItem('reset-quiz-xp');
    if (savedIndex) setCurrentQuestionIndex(Math.min(parseInt(savedIndex), allQuestions.length));
    if (savedXp) setXp(parseInt(savedXp));
    setIsLoaded(true);
  }, []);

  // Salvar progresso
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
    
    // Lógica de pontos: A=0, B=5, C=10
    const points = key === 'C' ? 10 : key === 'B' ? 5 : 0;
    setXp(prev => prev + points);

    // Tocar sons baseados na escolha
    tocarSom(key as 'A' | 'B' | 'C');

    setShowFeedback(true);

    setTimeout(() => {
      setShowFeedback(false);
      setSelectedAnswer(null);
      setCurrentQuestionIndex(prev => prev + 1);
      // Se mudar de nível (a cada 20 questões aproximadamente), toca som de level-up
      if ((currentQuestionIndex + 1) % 20 === 0) {
        tocarSom('nivel');
      }
    }, 2000);
  };

  const handleRestart = () => {
    localStorage.clear();
    window.location.reload();
  };

  if (!isLoaded) return <div className="text-white text-center p-10">Carregando Missão...</div>;

  const isQuizFinished = currentQuestionIndex >= allQuestions.length;
  const progress = (currentQuestionIndex / allQuestions.length) * 100;
  const currentQuestion = allQuestions[currentQuestionIndex];

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {/* HEADER DO APP RESET */}
      <div className="mb-6 flex items-center justify-between bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
        <h2 className="font-black text-xl flex items-center gap-2 text-white">
          <RotateCw className="w-5 h-5 text-red-500" /> RESET
        </h2>
        <div className="flex items-center gap-2 font-bold text-green-400 bg-green-400/10 px-4 py-1 rounded-full border border-green-400/20">
          <Award className="w-5 h-5" />
          <span>{xp} XP</span>
        </div>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 overflow-hidden relative min-h-[500px] flex flex-col shadow-2xl">
        <Progress value={progress} className="h-1 bg-zinc-800" />
        
        {isQuizFinished ? (
          <div className="p-10 text-center flex flex-col items-center justify-center gap-6 flex-grow">
            <h2 className="text-4xl font-black text-white">ZEROU O JOGO!</h2>
            <div className="text-6xl font-black text-green-400">{xp} XP</div>
            <p className="text-zinc-400">Você dominou seu Neocórtex e agora é um Mestre da Mente.</p>
            <Button onClick={handleRestart} variant="destructive" size="lg" className="font-bold uppercase tracking-widest">
              Reiniciar Run
            </Button>
          </div>
        ) : (
          <div className="relative flex-grow flex flex-col p-6">
            <CardHeader className="p-0 mb-6">
              <CardDescription className="text-zinc-500 font-mono">
                MISSÃO {currentQuestion.id} / 100
              </CardDescription>
              <CardTitle className="text-xl md:text-2xl text-white leading-tight">
                {currentQuestion.texto}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0 grid gap-3">
              {Object.entries(currentQuestion.alternativas).map(([key, value]) => (
                <Button
                  key={key}
                  variant="outline"
                  className={`h-auto justify-start text-left p-4 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 text-white transition-all ${
                    selectedAnswer === key ? 'border-primary ring-1 ring-primary' : ''
                  }`}
                  onClick={() => handleAnswerSelect(key)}
                  disabled={!!selectedAnswer}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center font-bold text-zinc-500">
                      {key}
                    </div>
                    <span className="flex-1 text-sm md:text-base">{value}</span>
                  </div>
                </Button>
              ))}
            </CardContent>

            {/* Feedback Gamificado */}
            {showFeedback && (
              <div className="absolute inset-0 bg-zinc-950/90 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                <BrainIcon type={selectedAnswer!} className="w-16 h-16 mb-4 text-primary animate-bounce" />
                <h3 className="text-2xl font-black text-white mb-2">
                  {selectedAnswer === 'C' ? 'NEOCÓRTEX ATIVADO!' : selectedAnswer === 'B' ? 'SISTEMA LÍMBICO' : 'CÉREBRO REPTILIANO'}
                </h3>
                <p className="text-zinc-400">Processando evolução mental...</p>
              </div>
            )}
          </div>
        )}
      </Card>

      <p className="text-center mt-6 text-zinc-600 text-[10px] uppercase tracking-[0.2em]">
        Status: Online • Engine: Next.js • Database: Local
      </p>
    </div>
  );
}
