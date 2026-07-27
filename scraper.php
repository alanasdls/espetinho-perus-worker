<?php
/**
 * Motor Central de Extração de Loterias com Suporte a Múltiplas Fontes e Anonimização
 */

date_default_timezone_set('America/Belem');

/**
 * Tabela oficial de bichos do Jogo do Bicho (Grupos 01 a 25)
 */
function obterInfoBichoPorMilhar($milhar) {
    $dezena = intval(substr(str_pad($milhar, 4, '0', STR_PAD_LEFT), -2));
    
    if ($dezena === 0) {
        $grupo = 25;
    } else {
        $grupo = (int) ceil($dezena / 4);
    }

    $tabelaBichos = [
        1  => ['nome' => 'Avestruz', 'emoji' => '🦩'],
        2  => ['nome' => 'Águia',    'emoji' => '🦅'],
        3  => ['nome' => 'Burro',    'emoji' => '🫏'],
        4  => ['nome' => 'Borboleta','emoji' => '🦋'],
        5  => ['nome' => 'Cachorro', 'emoji' => '🐕'],
        6  => ['nome' => 'Cabra',    'emoji' => '🐐'],
        7  => ['nome' => 'Carneiro', 'emoji' => '🐏'],
        8  => ['nome' => 'Camelo',   'emoji' => '🐪'],
        9  => ['nome' => 'Cobra',    'emoji' => '🐍'],
        10 => ['nome' => 'Coelho',   'emoji' => '🐇'],
        11 => ['nome' => 'Cavalo',   'emoji' => '🐎'],
        12 => ['nome' => 'Elefante', 'emoji' => '🐘'],
        13 => ['nome' => 'Galo',     'emoji' => '🐓'],
        14 => ['nome' => 'Gato',     'emoji' => '🐈'],
        15 => ['nome' => 'Jacaré',   'emoji' => '🐊'],
        16 => ['nome' => 'Leão',     'emoji' => '🦁'],
        17 => ['nome' => 'Macaco',   'emoji' => '🐒'],
        18 => ['nome' => 'Porco',    'emoji' => '🐖'],
        19 => ['nome' => 'Pavão',    'emoji' => '🦚'],
        20 => ['nome' => 'Peru',     'emoji' => '🦃'],
        21 => ['nome' => 'Touro',    'emoji' => '🐂'],
        22 => ['nome' => 'Tigre',    'emoji' => '🐅'],
        23 => ['nome' => 'Urso',     'emoji' => '🐻'],
        24 => ['nome' => 'Veado',    'emoji' => '🦌'],
        25 => ['nome' => 'Vaca',     'emoji' => '🐄']
    ];

    $info = $tabelaBichos[$grupo] ?? ['nome' => 'Bicho', 'emoji' => '🐾'];
    
    return [
        'grupo' => sprintf('%02d', $grupo),
        'nome'  => $info['nome'],
        'emoji' => $info['emoji']
    ];
}

/**
 * Mapeamento seguro de bancas com URLs codificadas em Base64
 */
function obterBancasSuportadas() {
    return [
        'rio' => [
            'nome'    => 'Rio de Janeiro (PT Rio)',
            'estado'  => 'RJ',
            'fonte_1' => 'aHR0cHM6Ly9wdHJpby5pbmYuYnIv',
            'fonte_2' => 'aHR0cHM6Ly9iaWNob2NlcnRvLmNvbS8='
        ],
        'federal' => [
            'nome'    => 'Loteria Federal',
            'estado'  => 'BR',
            'fonte_1' => 'aHR0cHM6Ly9wdHJpby5pbmYuYnIvbG90ZXJpYS1mZWRlcmFsLWpvZ28tZG8tYmljaG8v',
            'fonte_2' => 'aHR0cHM6Ly9iaWNob2NlcnRvLmNvbS8='
        ],
        'goias' => [
            'nome'    => 'Goiás (Look Loterias)',
            'estado'  => 'GO',
            'fonte_1' => 'aHR0cHM6Ly9wdHJpby5pbmYuYnIvam9nby1kby1iaWNoby1sb29rLw==',
            'fonte_2' => 'aHR0cHM6Ly93d3cucmVzdWx0YWRvZmFjaWwuY29tLmJyL3Jlc3VsdGFkby1kby1qb2dvLWRvLWJpY2hvL2xvb2stZ29pYXM='
        ],
        'nacional' => [
            'nome'    => 'Loteria Nacional',
            'estado'  => 'BR',
            'fonte_1' => 'aHR0cHM6Ly9wdHJpby5pbmYuYnIvcmVzdWx0YWRvLWRhLW5hY2lvbmFsLw==',
            'fonte_2' => 'aHR0cHM6Ly9iaWNob2NlcnRvLmNvbS8='
        ],
        'bahia' => [
            'nome'    => 'Bahia (ParaTodos)',
            'estado'  => 'BA',
            'fonte_1' => 'aHR0cHM6Ly9wdHJpby5pbmYuYnIvcGFyYXRvZG9zLWJhaGlhLw==',
            'fonte_2' => 'aHR0cHM6Ly93d3cucmVzdWx0YWRvZmFjaWwuY29tLmJyL3Jlc3VsdGFkby1kby1qb2dvLWRvLWJpY2hvL3BhcmF0b2Rvcy1iYWhpYQ=='
        ],
        'bahia-maluca' => [
            'nome'    => 'Bahia Maluca',
            'estado'  => 'BA',
            'fonte_1' => 'aHR0cHM6Ly9wdHJpby5pbmYuYnIvcGFyYXRvZG9zLWJhaGlhLw==',
            'fonte_2' => 'aHR0cHM6Ly93d3cucmVzdWx0YWRvZmFjaWwuY29tLmJyL3Jlc3VsdGFkby1kby1qb2dvLWRvLWJpY2hvL3BhcmF0b2Rvcy1iYWhpYQ=='
        ],
        'sp' => [
            'nome'    => 'São Paulo (PT-SP)',
            'estado'  => 'SP',
            'fonte_1' => 'aHR0cHM6Ly9wdHJpby5pbmYuYnIvam9nby1kby1iaWNoby1zYW8tcGF1bG8v',
            'fonte_2' => 'aHR0cHM6Ly9iaWNob2NlcnRvLmNvbS8='
        ],
        'paratodos' => [
            'nome'    => 'ParaTodos',
            'estado'  => 'BA',
            'fonte_1' => 'aHR0cHM6Ly9wdHJpby5pbmYuYnIvcGFyYXRvZG9zLWJhaGlhLw==',
            'fonte_2' => 'aHR0cHM6Ly93d3cucmVzdWx0YWRvZmFjaWwuY29tLmJyL3Jlc3VsdGFkby1kby1qb2dvLWRvLWJpY2hvL3BhcmF0b2Rvcy1iYWhpYQ=='
        ],
        'mg' => [
            'nome'    => 'Minas Gerais (Minas Dia / Alvorada)',
            'estado'  => 'MG',
            'fonte_1' => 'aHR0cHM6Ly9wdHJpby5pbmYuYnIvam9nby1kby1iaWNoby1taW5hcy1nZXJhaXMv',
            'fonte_2' => 'aHR0cHM6Ly93d3cucmVzdWx0YWRvZmFjaWwuY29tLmJyL3Jlc3VsdGFkby1kby1qb2dvLWRvLWJpY2hvL21pbmFzLWdlcmFpcw=='
        ],
        'maluquinharj' => [
            'nome'    => 'Maluquinha RJ',
            'estado'  => 'RJ',
            'fonte_1' => 'aHR0cHM6Ly9wdHJpby5pbmYuYnIvbWFsdXF1aW5oYS1yaW8tZGUtamFuZWlyby8=',
            'fonte_2' => 'aHR0cHM6Ly9iaWNob2NlcnRvLmNvbS8='
        ],
        'lotece' => [
            'nome'    => 'Lotece (Ceará / Loteria dos Sonhos)',
            'estado'  => 'CE',
            'fonte_1' => 'aHR0cHM6Ly9wdHJpby5pbmYuYnIvbG90ZXJpYS1kb3Mtc29uaG9zLw==',
            'fonte_2' => 'aHR0cHM6Ly9iaWNob2NlcnRvLmNvbS8='
        ],
        'abaese' => [
            'nome'    => 'Abaese (Sergipe)',
            'estado'  => 'SE',
            'fonte_1' => 'aHR0cHM6Ly9wdHJpby5pbmYuYnIvYWJhZXNlLw==',
            'fonte_2' => 'aHR0cHM6Ly9iaWNob2NlcnRvLmNvbS8='
        ],
        'brasilia' => [
            'nome'    => 'Brasília (BR Loterias / LBR)',
            'estado'  => 'DF',
            'fonte_1' => 'aHR0cHM6Ly9wdHJpby5pbmYuYnIvbG90ZXJpYXMtYnIv',
            'fonte_2' => 'aHR0cHM6Ly9iaWNob2NlcnRvLmNvbS8='
        ],
        'rs' => [
            'nome'    => 'Rio Grande do Sul (Bicho RS)',
            'estado'  => 'RS',
            'fonte_1' => 'aHR0cHM6Ly9wdHJpby5pbmYuYnIvYmljaG8tcnMv',
            'fonte_2' => 'aHR0cHM6Ly9iaWNob2NlcnRvLmNvbS8='
        ]
    ];
}

/**
 * Função principal de scraping com redundância (Failover automático)
 */
function buscarResultadosLoterias($bancaChave = 'rio', $apenasHoje = true) {
    $bancas = obterBancasSuportadas();
    $dataHoje = date('d/m/Y');

    if ($bancaChave === 'todos') {
        $todosResultados = [];
        foreach ($bancas as $chave => $meta) {
            if ($chave === 'bahia-maluca' || $chave === 'paratodos') continue;
            
            $res = executarBuscaComFallback($meta, $chave, $apenasHoje, $dataHoje);
            if ($res['sucesso']) {
                $todosResultados[$chave] = $res;
            }
        }
        return [
            'sucesso'       => true,
            'banca'         => 'Todas as Bancas',
            'fonte'         => 'Rede Oficial de Loterias Brasil',
            'data_consulta' => date('Y-m-d H:i:s'),
            'total_bancas'  => count($todosResultados),
            'bancas'        => $todosResultados
        ];
    }

    if (!isset($bancas[$bancaChave])) {
        return [
            'sucesso' => false,
            'erro'    => "Banca '$bancaChave' não encontrada. Bancas válidas: " . implode(', ', array_keys($bancas)) . ", todos"
        ];
    }

    $meta = $bancas[$bancaChave];
    return executarBuscaComFallback($meta, $bancaChave, $apenasHoje, $dataHoje);
}

/**
 * Tenta executar a busca na Fonte 1. Se falhar, utiliza automaticamente a Fonte 2.
 */
function executarBuscaComFallback($meta, $bancaChave, $apenasHoje, $dataHoje) {
    $url1 = base64_decode($meta['fonte_1']);
    $res1 = extrairResultadosDaUrl($url1, $bancaChave, $meta, $apenasHoje, $dataHoje);

    if ($res1['sucesso'] && !empty($res1['sorteios'])) {
        return $res1;
    }

    // Tenta Fonte 2 caso a Fonte 1 esteja indisponível
    $url2 = base64_decode($meta['fonte_2']);
    $res2 = extrairResultadosDaUrl($url2, $bancaChave, $meta, $apenasHoje, $dataHoje);

    if ($res2['sucesso'] && !empty($res2['sorteios'])) {
        $res2['servidor_rede'] = 'Rede Secundaria de Contingencia';
        return $res2;
    }

    return $res1['sucesso'] ? $res1 : $res2;
}

/**
 * Baixa e analisa o HTML anonimizando qualquer domínio
 */
function extrairResultadosDaUrl($url, $bancaChave, $meta, $apenasHoje, $dataHoje) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 12);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    $html = curl_exec($ch);
    curl_close($ch);

    if (!$html) {
        return [
            'sucesso' => false,
            'erro'    => "Serviço temporariamente indisponível."
        ];
    }

    // Processamento do HTML
    $htmlClean = str_ireplace(['</td>', '</div>', '</li>', '</p>', '<br>', '<br/>'], "\n", $html);
    $htmlClean = preg_replace('/<script\b[^>]*>(.*?)<\/script>/is', "", $htmlClean);
    $htmlClean = preg_replace('/<style\b[^>]*>(.*?)<\/style>/is', "", $htmlClean);

    $texto = strip_tags($htmlClean);
    $texto = preg_replace('/[ \t]+/', ' ', $texto);
    $texto = preg_replace('/[\r\n]+/', "\n", $texto);
    $linhas = explode("\n", $texto);

    $sorteios = [];
    $extracaoAtual = [];
    $horarioAtual = "";
    $dataAtual = "";

    for ($i = 0; $i < count($linhas); $i++) {
        $linha = trim($linhas[$i]);
        if (empty($linha)) continue;

        // Detecta cabeçalho de sorteio
        if (preg_match('/Sorteio\s+.+/i', $linha)) {
            if ($horarioAtual !== "" && count($extracaoAtual) > 0) {
                if (!$apenasHoje || strpos($dataAtual, $dataHoje) !== false) {
                    if ($bancaChave === 'bahia-maluca') {
                        if (stripos($horarioAtual, 'Maluca') !== false) {
                            $sorteios[] = criarBlocoSorteio($horarioAtual, $dataAtual, $extracaoAtual);
                        }
                    } elseif ($bancaChave === 'bahia') {
                        if (stripos($horarioAtual, 'Maluca') === false) {
                            $sorteios[] = criarBlocoSorteio($horarioAtual, $dataAtual, $extracaoAtual);
                        }
                    } else {
                        $sorteios[] = criarBlocoSorteio($horarioAtual, $dataAtual, $extracaoAtual);
                    }
                }
                $extracaoAtual = [];
                $dataAtual = "";
            }

            $horarioAtual = $linha;

            for ($j = 1; $j <= 4; $j++) {
                if (isset($linhas[$i + $j])) {
                    $prox = trim($linhas[$i + $j]);
                    if (preg_match('/\d{2}\/\d{2}\/\d{4}/', $prox, $matchesData)) {
                        $dataAtual = $matchesData[0];
                        break;
                    }
                }
            }
        }

        // Detecta linhas de prêmio inline
        if (preg_match('/^([1-9]|10)º\s+(\d{3,5})(?:\s+(.+))?$/i', $linha, $m)) {
            $premioNum = $m[1] . 'º';
            $milharRaw = $m[2];
            $milhar = (strlen($milharRaw) > 4) ? substr($milharRaw, -4) : str_pad($milharRaw, 4, '0', STR_PAD_LEFT);
            $bichoTexto = isset($m[3]) ? trim($m[3]) : '';
            
            $infoBicho = obterInfoBichoPorMilhar($milhar);
            $nomeBicho = limparNomeBicho($bichoTexto, $infoBicho['nome']);

            $extracaoAtual[] = [
                'premio' => $premioNum,
                'milhar' => $milharRaw,
                'grupo'  => $infoBicho['grupo'],
                'bicho'  => $nomeBicho,
                'emoji'  => $infoBicho['emoji']
            ];
        } 
        // Detecta prêmio quebrado em múltiplas linhas
        elseif (preg_match('/^([1-9]|10)º$/', $linha, $m)) {
            if (isset($linhas[$i + 1])) {
                $posivelMilhar = trim($linhas[$i + 1]);
                if (is_numeric($posivelMilhar)) {
                    $milharRaw = $posivelMilhar;
                    $milhar = (strlen($milharRaw) > 4) ? substr($milharRaw, -4) : str_pad($posivelMilhar, 4, '0', STR_PAD_LEFT);
                    $bichoTexto = isset($linhas[$i + 2]) ? trim($linhas[$i + 2]) : '';
                    
                    $infoBicho = obterInfoBichoPorMilhar($milhar);
                    $nomeBicho = (!empty($bichoTexto) && !is_numeric($bichoTexto) && !preg_match('/^\d+º$/', $bichoTexto)) 
                                 ? limparNomeBicho($bichoTexto, $infoBicho['nome']) : $infoBicho['nome'];

                    $extracaoAtual[] = [
                        'premio' => $m[1] . 'º',
                        'milhar' => $milharRaw,
                        'grupo'  => $infoBicho['grupo'],
                        'bicho'  => $nomeBicho,
                        'emoji'  => $infoBicho['emoji']
                    ];
                    
                    if ($bichoTexto !== '' && !is_numeric($bichoTexto) && !preg_match('/^\d+º$/', $bichoTexto)) {
                        $i += 2;
                    } else {
                        $i += 1;
                    }
                }
            }
        }
    }

    if ($horarioAtual !== "" && count($extracaoAtual) > 0) {
        if (!$apenasHoje || strpos($dataAtual, $dataHoje) !== false) {
            if ($bancaChave === 'bahia-maluca') {
                if (stripos($horarioAtual, 'Maluca') !== false) {
                    $sorteios[] = criarBlocoSorteio($horarioAtual, $dataAtual, $extracaoAtual);
                }
            } elseif ($bancaChave === 'bahia') {
                if (stripos($horarioAtual, 'Maluca') === false) {
                    $sorteios[] = criarBlocoSorteio($horarioAtual, $dataAtual, $extracaoAtual);
                }
            } else {
                $sorteios[] = criarBlocoSorteio($horarioAtual, $dataAtual, $extracaoAtual);
            }
        }
    }

    return [
        'sucesso'       => true,
        'banca_chave'   => $bancaChave,
        'banca_nome'    => $meta['nome'],
        'estado'        => $meta['estado'],
        'fonte'         => 'Rede Oficial de Loterias Brasil',
        'data_consulta' => date('Y-m-d H:i:s'),
        'total_sorteios'=> count($sorteios),
        'sorteios'      => $sorteios
    ];
}

function limparNomeBicho($bichoTexto, $nomePadrao) {
    if (empty($bichoTexto)) return $nomePadrao;
    
    $bichoTexto = preg_replace('/\s*\(\d+\)/', '', $bichoTexto);
    
    $lower = strtolower(trim($bichoTexto));
    if (in_array($lower, ['soma', 'multiplicação', 'multiplicacao', ''])) {
        return $nomePadrao;
    }
    
    return trim($bichoTexto);
}

function criarBlocoSorteio($horario, $data, $extracao) {
    return [
        'horario'  => $horario,
        'data'     => !empty($data) ? $data : date('d/m/Y'),
        'extracao' => $extracao
    ];
}
