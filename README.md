# 📊 FinControl Web

Uma aplicação Web completa (Full Stack) para gestão financeira pessoal, desenvolvida para facilitar o controle de receitas, despesas e acompanhamento de metas financeiras através de um dashboard interativo.

## 🚀 Tecnologias Utilizadas
* **Frontend:** HTML5, CSS3, Vanilla JavaScript, Bootstrap 5, Chart.js, SweetAlert2
* **Backend:** Java, Spring Boot, Spring Data JPA
* **Banco de Dados:** MySQL
* **Infraestrutura/Deploy:** GitHub Pages (Hospedagem Frontend), Ngrok (Túnel reverso para a API local)

## 🎯 Funcionalidades
* **Autenticação:** Sistema de login com proteção de rotas.
* **Dashboard Interativo:** Resumo financeiro em tempo real com gráficos (Chart.js) dinâmicos.
* **Controle de Caixa Duplo:** Exibição do Resultado do Mês selecionado e do Saldo Total Acumulado (histórico).
* **Gestão de Transações:** CRUD completo (Criar, Ler, Atualizar, Deletar) de receitas e despesas.
* **Objetivos Financeiros:** Criação e acompanhamento de metas com barra de progresso automática.
* **UX/UI:** Categorização visual com ícones automáticos baseados na descrição da transação (ex: lanche, gasolina, salário).

## 💡 Arquitetura e Comunicação
O projeto segue uma arquitetura desacoplada consumindo uma API RESTful. O frontend (JavaScript puro) faz requisições assíncronas (`fetch`) para os endpoints do backend (Java Spring Boot). 

Para viabilizar o acesso remoto via nuvem ao banco de dados local, foi implementado um túnel reverso seguro com o **Ngrok**, permitindo que a interface hospedada no GitHub Pages comunique-se perfeitamente com o servidor e o MySQL locais, contornando bloqueios de rede.

---
> Desenvolvido por Matheus Diniz.
