# daily-diet

## Requisitos Funcionais

- [ ] Deve ser possível criar um usuário;
- [ ] Deve ser possível identificar o usuário entre as requisições;
- [ ] Deve ser possível registrar uma refeição feita;
- [ ] Deve ser possível editar todos os campos de uma refeição;
- [ ] Deve ser possível apagar uma refeição;
- [ ] Deve ser possível listar todas as refeições de um usuário;
- [ ] Deve ser possível visualizar uma única refeição;
- [ ] Deve ser possível recuperar as métricas de um usuário;

## Regras de Negócio

- [ ] As refeições devem ser relacionadas a um usuário e deve conter:
      - Nome
      - Descrição
      - Data e Hora
      - Está dentro ou não da dieta
      
- [ ] As métricas de um usuário devem conter:
      - Quantidade total de refeições registradas
      - Quantidade total de refeições dentro da dieta
      - Quantidade total de refeições fora da dieta
      - Melhor sequência por dia de refeições dentro da dieta

- [ ] O usuário só pode visualizar, editar e apagar as refeições o qual ele criou