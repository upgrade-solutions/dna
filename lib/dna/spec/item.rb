module DNA
  class Spec
    class Item
      attr_accessor :key, :value, :value_type

      def initialize(key, value)
        @key = key
        @value = value
        @value_type = value.class.name
      end
    end
  end
end