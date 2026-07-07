from rest_framework import serializers





class FamilyMemberSerializer(serializers.Serializer):

    name = serializers.CharField(max_length=200)

    relationship = serializers.ChoiceField(

        choices=["Spouse", "Son", "Daughter", "Mother", "Father", "Other"]

    )

    age = serializers.IntegerField(min_value=0, max_value=120)

    financially_dependent = serializers.BooleanField()





class PersonalDetailsSerializer(serializers.Serializer):

    full_name = serializers.CharField(max_length=200)

    date_of_birth = serializers.DateField(required=False, allow_null=True)

    age = serializers.IntegerField(min_value=0, max_value=120)

    gender = serializers.CharField(max_length=50, required=False, allow_null=True, allow_blank=True)

    marital_status = serializers.ChoiceField(

        choices=["Single", "Married", "Divorced", "Widowed", "Separated"]

    )

    retirement_age = serializers.IntegerField(min_value=40, max_value=80)

    occupation = serializers.CharField(max_length=200)





class IncomeItemSerializer(serializers.Serializer):

    amount = serializers.FloatField(min_value=0, required=False, default=0)

    period = serializers.ChoiceField(choices=["annual", "monthly"], required=False, default="annual")

    annual = serializers.FloatField(min_value=0, required=False, default=0)





class IncomeSerializer(serializers.Serializer):

    salary = IncomeItemSerializer(required=False)

    business = IncomeItemSerializer(required=False)

    rental = IncomeItemSerializer(required=False)

    interest = IncomeItemSerializer(required=False)

    other = IncomeItemSerializer(required=False)

    total_annual = serializers.FloatField(required=False, default=0)





class ExpensesSerializer(serializers.Serializer):

    monthly_household = serializers.FloatField(min_value=0, required=False, default=0)

    annual_lifestyle = serializers.FloatField(min_value=0, required=False, default=0)

    existing_emis = serializers.FloatField(min_value=0, required=False, default=0)

    other_expenses = serializers.FloatField(min_value=0, required=False, default=0)

    total_annual = serializers.FloatField(required=False, default=0)

    annual_savings = serializers.FloatField(required=False, default=0)

    investment_surplus = serializers.FloatField(required=False, default=0)





class GoalSerializer(serializers.Serializer):

    name = serializers.CharField(max_length=200)

    template_key = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    current_cost = serializers.FloatField(min_value=0, required=False, default=0)

    target_corpus = serializers.FloatField(min_value=0, required=False, default=0)

    interest = serializers.FloatField(min_value=0, required=False, default=0)





class MutualFundSerializer(serializers.Serializer):

    scheme_name = serializers.CharField(max_length=300)

    invested_amount = serializers.FloatField(min_value=0, required=False, default=0)

    current_value = serializers.FloatField(min_value=0, required=False, default=0)

    xirr = serializers.FloatField(required=False, default=0)

    profit_loss = serializers.FloatField(required=False, default=0)





class StockSerializer(serializers.Serializer):

    name = serializers.CharField(max_length=200)

    quantity = serializers.FloatField(min_value=0, required=False, default=0)

    avg_buy_price = serializers.FloatField(min_value=0, required=False, default=0)

    current_market_price = serializers.FloatField(min_value=0, required=False, default=0)

    current_value = serializers.FloatField(required=False, default=0)

    xirr = serializers.FloatField(required=False, default=0)

    profit_loss = serializers.FloatField(required=False, default=0)





class InvestmentsSerializer(serializers.Serializer):

    mutual_funds = MutualFundSerializer(many=True, required=False, default=list)

    stocks = StockSerializer(many=True, required=False, default=list)





class EmergencyFundItemSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200)
    amount = serializers.FloatField(min_value=0, required=False, default=0)
    required = serializers.FloatField(min_value=0, required=False, default=0)
    gap = serializers.FloatField(required=False, default=0)
    where_to_invest = serializers.CharField(max_length=200, required=False, allow_blank=True, allow_null=True)


class EmergencyFundSerializer(serializers.Serializer):
    required_fund = serializers.FloatField(min_value=0, required=False, default=0)
    items = EmergencyFundItemSerializer(many=True, required=False, default=list)


class ClientPayloadSerializer(serializers.Serializer):
    personal = PersonalDetailsSerializer()
    family_members = FamilyMemberSerializer(many=True, required=False, default=list)
    income = IncomeSerializer(required=False)
    expenses = ExpensesSerializer(required=False)
    assets = serializers.DictField(required=False, default=dict)
    liabilities = serializers.DictField(required=False, default=dict)
    goals = GoalSerializer(many=True, required=False, default=list)
    investments = InvestmentsSerializer(required=False)
    insurance = serializers.DictField(required=False, default=dict)
    emergency_fund = EmergencyFundSerializer(required=False)
    assumptions = serializers.DictField(required=False, default=dict)


