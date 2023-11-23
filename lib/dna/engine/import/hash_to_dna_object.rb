module DNA::Engine::Import
  class HashToDNAObject
    attr_reader :context, :dna_object

    def initialize(context:)
      @context = context
      construct_dna_object
    end

    def construct_dna_object
      scope = context[:scope] || "DNA::Spec"
      @dna_object = Object.const_get(scope).new(context[:input_hash])
    end
  end
end