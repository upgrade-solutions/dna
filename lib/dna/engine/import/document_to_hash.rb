require 'json'
require 'yaml'

module DNA::Engine::Import
  class DocumentToHash
    attr_reader :input_string, :file_path, :hash, :errors

    def initialize(input_string: nil, file_path: nil)
      @input_string = input_string
      assign_hash
    end

    private

    def assign_hash
      return if valid_json? || valid_yaml?
      @errors = "Invalid JSON/YAML"
    end

    def valid_json?
      @hash = JSON.parse(input_string)
    rescue JSON::ParserError => e
      false
    end

    def valid_yaml?
      @hash = YAML.safe_load(input_string)
      @hash == "invalid" ? false : true
    rescue Psych::SyntaxError => e
      false
    end
  end
end