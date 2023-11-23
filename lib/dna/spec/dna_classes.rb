# Define a function to traverse the JSON tree
# def create_objects(json_data)
#   json_data.transform_values do |value|
#     if value.is_a?(Hash)
#       create_objects(value)
#     elsif value.is_a?(Array) && value.first.is_a?(String)
#       value.map { |v| Object.const_get(v).new }
#     else
#       value
#     end
#   end
# end

module DNA
  class Spec
    attr_accessor :Config, :Domain, :Application, :Infrastructure

    def initialize(json_hash)
      json_hash = {
        "Config" => {
          # "Adapters" => ["Domain::Objects::Adapters::TypeSchema"]
        },
        "Domain" => {
          "Objects" => {
            "Student" => {
              "Properties" => {
                "FirstName" => {
                  "type" => "string"
                },
                "LastName" => {
                  "type" => "string"
                },
                "Age" => {
                  "type" => "integer"
                },
                "Faculty" => {
                  "$ref" => "Faculty"
                }
              }
            },
            "Faculty" => {
              "Properties" => {
                "Name" => {
                  "type" => "string"
                }
              }
            }
          }
        },
        "Application" => {},
        "Infrastructure" => {}
      }
      @Config = Config.new(json_hash["Config"])
      @Domain = Domain.new(json_hash["Domain"])
      @Application = Application.new
      @Infrastructure = Infrastructure.new
    end

    class Base
      # attr_accessor :input_hash

      def initialize(input_hash, attrs)
        attrs.each do |attr|
          instance_variable_set("@#{attr}", input_hash[attr])
        end
        # @input_hash = input_hash
      end
    end

    class Config < Base
      ATTRS = ["Adapters"]
      attr_accessor(*ATTRS)

      def initialize(input_hash)
        super(input_hash, ATTRS)
      end
    end

    class Domain < Base
      ATTRS = ["Objects"]
      attr_accessor(*ATTRS)
  
      def initialize(input_hash)
        super(input_hash, ATTRS)
      end

      def self.new_from_adapter(input_hash, adapter)
        domain_hash = InputAdapter.const_get(adapter).new(input_hash)
        new(domain_hash.output_hash)
      end

      class Object < Base
        ATTRS = ["Properties"]
        attr_accessor(*ATTRS)
    
        def initialize(input_hash)
          super(input_hash, ATTRS)
        end
      end

      module InputAdapter
        class TypeSchema
          attr_accessor :input_schema, :output_hash

          def initialize(input_schema)
            @input_schema = input_schema
          end

          def adapt
            input_schema["Objects"]["definitions"].transform_values do |value|
              Object.const_get(value["type"]).new(value)
            end
          end
        end
      end

      class Objects; end
    end

    class Application; end
    class Infrastructure; end
  end
end

# Class.constants (gets children)

# hash = { a: { b: 1 } }
# hash.dig(:a, :b) == hash.dig(*[:a, :b])

# get list of attr_accessors

