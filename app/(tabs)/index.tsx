import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Image,
  LayoutAnimation,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

type DiaDaSemana = 'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex';

interface Exercicio {
  id: string;
  nome: string;
  series: string;
}

const gerarId = () => Math.random().toString(36).substring(2, 10);

const treinoSemanaInicial: Record<DiaDaSemana, Exercicio[]> = {
  Seg: [],
  Ter: [],
  Qua: [],
  Qui: [],
  Sex: [],
};

const exerciciosPorCategoria: Record<string, string[]> = {
  Peito: [
    'Supino reto com barra',
    'Supino inclinado com halteres',
    'Crossover no cabo',
    'Crucifixo com halteres',
    'Flexão de braço',
  ],
  Costas: [
    'Puxada frontal',
    'Remada baixa',
    'Levantamento terra',
    'Pullover',
    'Remada curvada',
  ],
  Bíceps: [
    'Rosca direta com barra',
    'Rosca alternada com halteres',
    'Rosca martelo',
    'Rosca concentrada',
  ],
  Ombros: [
    'Desenvolvimento com halteres',
    'Elevação lateral com halteres',
    'Crucifixo inverso',
    'Elevação frontal',
    'Arnold press',
  ],
  Pernas: [
    'Leg press 45°',
    'Agachamento no smith',
    'Cadeira extensora',
    'Cadeira flexora',
    'Stiff',
  ],
  Glúteos: [
    'Elevação de quadril com barra',
    'Avanço',
    'Glute bridge',
    'Agachamento sumô',
  ],
  Panturrilhas: [
    'Panturrilha em pé',
    'Panturrilha sentado',
  ],
  Cardio: [
    'Cardio leve/moderado',
    'Corrida',
    'Ciclismo',
    'Pular corda',
  ],
};

// Mapeie os exercícios para a URL do GIF correspondente (exemplo)
const gifUrls: Record<string, string> = {
  'Supino reto com barra': 'https://www.hipertrofia.org/blog/wp-content/uploads/2017/09/barbell-bench-press.gif',
  'Supino inclinado com halteres': 'https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/supino-inclinado-com-halteres.gif',
  'Crossover no cabo': 'https://meutreinador.com/wp-content/uploads/2024/04/Crossover-polia-alta.gif',
  'Crucifixo com halteres': 'https://www.hipertrofia.org/blog/wp-content/uploads/2023/09/dumbbell-fly.gif',
  'Flexão de braço': 'https://www.mundoboaforma.com.br/wp-content/uploads/2021/04/flexao-de-bracos.gif',
  // Adicione outras URLs para os demais exercícios aqui...
};

const STORAGE_KEY_TREINO = '@treinoSemana';
const STORAGE_KEY_DIAS = '@diasTreinados';

export default function App() {
  const [diaSelecionado, setDiaSelecionado] = useState<DiaDaSemana>('Seg');
  const [treinoSemana, setTreinoSemana] = useState<Record<DiaDaSemana, Exercicio[]>>(treinoSemanaInicial);
  const [exerciciosFeitos, setExerciciosFeitos] = useState<{ [key: string]: boolean }>({});
  const [diasTreinados, setDiasTreinados] = useState<{ [key in DiaDaSemana]?: boolean }>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('Peito');
  const [gifModalVisible, setGifModalVisible] = useState(false);
  const [gifSelecionado, setGifSelecionado] = useState<string | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    salvarDados();
  }, [treinoSemana, diasTreinados]);

  async function carregarDados() {
    try {
      const treinoString = await AsyncStorage.getItem(STORAGE_KEY_TREINO);
      const diasString = await AsyncStorage.getItem(STORAGE_KEY_DIAS);

      if (treinoString) {
        const treinoSalvo = JSON.parse(treinoString);
        setTreinoSemana(treinoSalvo);
      }

      if (diasString) {
        const diasSalvos = JSON.parse(diasString);
        setDiasTreinados(diasSalvos);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }

  async function salvarDados() {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_TREINO, JSON.stringify(treinoSemana));
      await AsyncStorage.setItem(STORAGE_KEY_DIAS, JSON.stringify(diasTreinados));
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    }
  }

  const toggleExercicio = (id: string) => {
    LayoutAnimation.easeInEaseOut();
    setExerciciosFeitos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleDia = (dia: DiaDaSemana) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setDiasTreinados((prev) => ({ ...prev, [dia]: !prev[dia] }));
  };

  const diasSemana: DiaDaSemana[] = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];

  function atualizarSeries(id: string, novasSeries: string) {
    setTreinoSemana((prev) => {
      const novoDia = prev[diaSelecionado].map((ex) =>
        ex.id === id ? { ...ex, series: novasSeries } : ex
      );
      return { ...prev, [diaSelecionado]: novoDia };
    });
  }

  function removerExercicio(id: string) {
    setTreinoSemana((prev) => {
      const copia = { ...prev };
      copia[diaSelecionado] = copia[diaSelecionado].filter((ex) => ex.id !== id);
      return copia;
    });
  }

  function adicionarExercicioNaSemana(nomeExercicio: string) {
    setTreinoSemana((prev) => {
      const copia = { ...prev };
      if (copia[diaSelecionado].some((ex) => ex.nome === nomeExercicio)) {
        return copia;
      }
      copia[diaSelecionado] = [
        ...copia[diaSelecionado],
        { id: gerarId(), nome: nomeExercicio, series: '3x12' },
      ];
      return copia;
    });
  }

  function abrirGif(nomeExercicio: string) {
    const url = gifUrls[nomeExercicio];
    if (url) {
      setGifSelecionado(url);
      setGifModalVisible(true);
    } else {
      alert('GIF não disponível para este exercício.');
    }
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Meu Treino Semanal</Text>

        <View style={styles.presencaContainer}>
          {diasSemana.map((dia) => (
            <TouchableOpacity
              key={dia}
              onPress={() => toggleDia(dia)}
              style={[styles.diaBtn, diasTreinados[dia] && styles.diaAtivo]}
            >
              <Text style={styles.diaText}>{dia}</Text>
              {diasTreinados[dia] && (
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color="white"
                  style={{ marginTop: 4 }}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tabContainer}>
          {diasSemana.map((dia) => (
            <TouchableOpacity
              key={dia}
              style={[styles.tab, diaSelecionado === dia && styles.tabSelected]}
              onPress={() => setDiaSelecionado(dia)}
            >
              <Text style={styles.tabText}>{dia}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <DraggableFlatList
          data={treinoSemana[diaSelecionado]}
          onDragEnd={({ data }) =>
            setTreinoSemana((prev) => ({
              ...prev,
              [diaSelecionado]: data,
            }))
          }
          keyExtractor={(item) => item.id}
          renderItem={({ item, drag, isActive }: RenderItemParams<Exercicio>) => {
            const feito = exerciciosFeitos[item.id];

            return (
              <TouchableOpacity
                onLongPress={drag}
                onPress={() => toggleExercicio(item.id)}
                style={[
                  styles.card,
                  feito && styles.cardFeito,
                  isActive && { backgroundColor: '#6ee7b7' },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.nomeInput, feito && styles.textoFeito]}>{item.nome}</Text>
                  <TextInput
                    style={[styles.serieInput, feito && styles.textoFeito]}
                    value={item.series}
                    onChangeText={(text) => atualizarSeries(item.id, text)}
                  />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {feito && <Ionicons name="checkmark-circle" size={24} color="#4ade80" />}
                  
                  {/* Ícone olho */}
                  <TouchableOpacity
                    onPress={() => abrirGif(item.nome)}
                    style={{ marginLeft: 12 }}
                    accessibilityLabel="Visualizar execução do exercício"
                  >
                    <Ionicons name="eye" size={24} color="#3b82f6" />
                  </TouchableOpacity>

                  {/* Ícone lixeira */}
                  <TouchableOpacity
                    onPress={() => removerExercicio(item.id)}
                    style={{ marginLeft: 12 }}
                    accessibilityLabel="Remover exercício"
                  >
                    <Ionicons name="trash" size={24} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
        />

        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle" size={64} color="#4ade80" />
        </TouchableOpacity>

        {/* Modal para adicionar exercício */}
        <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Adicionar Exercício</Text>

            {/* Abas de categorias */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriasTabs}>
              {Object.keys(exerciciosPorCategoria).map((categoria) => (
                <TouchableOpacity
                  key={categoria}
                  style={[
                    styles.categoriaTab,
                    categoriaSelecionada === categoria && styles.categoriaTabSelecionada,
                  ]}
                  onPress={() => setCategoriaSelecionada(categoria)}
                >
                  <Text
                    style={[
                      styles.categoriaTabText,
                      categoriaSelecionada === categoria && styles.categoriaTabTextSelecionada,
                    ]}
                  >
                    {categoria}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView style={{ flex: 1, marginTop: 10 }}>
              {exerciciosPorCategoria[categoriaSelecionada].map((exercicio) => (
                <TouchableOpacity
                  key={exercicio}
                  style={styles.exercicioItem}
                  onPress={() => {
                    adicionarExercicioNaSemana(exercicio);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.exercicioTexto}>{exercicio}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.fecharModalBtn}
            >
              <Text style={styles.fecharModalTexto}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Modal do GIF */}
        <Modal
          visible={gifModalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setGifModalVisible(false)}
        >
          <View style={styles.gifModalBackground}>
            <View style={styles.gifModalContent}>
              <TouchableOpacity
                onPress={() => setGifModalVisible(false)}
                style={styles.fecharGifBtn}
              >
                <Ionicons name="close" size={28} color="white" />
              </TouchableOpacity>
              {gifSelecionado ? (
                <Image
                  source={{ uri: gifSelecionado }}
                  style={styles.gifImage}
                  resizeMode="contain"
                />
              ) : (
                <Text>GIF não disponível</Text>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0fdf4',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  presencaContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    justifyContent: 'space-around',
  },
  diaBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#94a3b8',
    alignItems: 'center',
  },
  diaAtivo: {
    backgroundColor: '#4ade80',
  },
  diaText: {
    color: 'white',
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    justifyContent: 'space-around',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#e0e7ff',
    borderRadius: 20,
  },
  tabSelected: {
    backgroundColor: '#3b82f6',
  },
  tabText: {
    color: 'white',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: 'white',
    padding: 14,
    marginBottom: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
  },
  cardFeito: {
    backgroundColor: '#d1fae5',
  },
  nomeInput: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    color: '#111827',
  },
  serieInput: {
    backgroundColor: '#e5e7eb',
    padding: 6,
    borderRadius: 6,
    width: 80,
    textAlign: 'center',
    color: '#374151',
  },
  textoFeito: {
    textDecorationLine: 'line-through',
    color: '#6b7280',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 30,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#e0e7ff',
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  categoriasTabs: {
    marginTop: 15,
    maxHeight: 40,
  },
  categoriaTab: {
    backgroundColor: '#c7d2fe',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  categoriaTabSelecionada: {
    backgroundColor: '#3b82f6',
  },
  categoriaTabText: {
    color: '#1e293b',
  },
  categoriaTabTextSelecionada: {
    color: 'white',
    fontWeight: 'bold',
  },
  exercicioItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#94a3b8',
  },
  exercicioTexto: {
    fontSize: 16,
  },
  fecharModalBtn: {
    padding: 12,
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    marginTop: 15,
    alignItems: 'center',
  },
  fecharModalTexto: {
    color: 'white',
    fontWeight: 'bold',
  },
  gifModalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gifModalContent: {
    width: '80%',
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
  },
  fecharGifBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  gifImage: {
    width: 250,
    height: 250,
    borderRadius: 12,
  },
});
